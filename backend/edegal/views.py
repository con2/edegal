import logging
from typing import ClassVar, Literal

import pydantic
from django.conf import settings
from django.core.mail import EmailMessage
from django.http import HttpRequest, JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View

from .models import Album, Photographer, Picture, Series
from .models.media_spec import FORMAT_CHOICES

SUPPORTED_FORMATS = {format for (format, disp) in FORMAT_CHOICES}
logger = logging.getLogger(__name__)


class StatusView(View):
    def get(self, request):
        return JsonResponse(dict(status="OK"))


class ApiV3View(View):
    http_method_names = ["get", "head"]

    def get(self, request, path):
        context = "album"

        if path == "":
            path = "/"
        elif path.endswith("/timeline"):
            # NOTE order: timeline of the root album is disallowed by design because it would contain _all_ photos of the gallery
            context = "timeline"
            path = path[: -len("/timeline")]

        extra_criteria = dict()
        if not request.user.is_staff:
            extra_criteria.update(is_public=True)

        try:
            album = Album.get_album_by_path(path, **extra_criteria)
        except Album.DoesNotExist:
            if redirect_dict := Album.resolve_upstream_redirects(
                path, **extra_criteria
            ):
                return JsonResponse(redirect_dict)
            else:
                return JsonResponse(
                    {"status": 404, "message": "album not found"},
                    status=404,
                )

        response = JsonResponse(
            album.as_dict(
                include_hidden=request.user.is_staff,
                context=context,
            )
        )

        download = request.GET.get("download", "false")
        if download.lower() not in ("false", "no", "0"):
            album.ensure_download()

        return response


class PhotographersApiV3View(View):
    http_method_names = ["get", "head"]

    def get(self, request):
        pseudoalbum = Album.objects.filter(path="/photographers").first()

        return JsonResponse(
            dict(
                path="/photographers",
                title="Photographers",
                body=pseudoalbum.body if pseudoalbum else "",
                subalbums=[
                    photog.make_subalbum()
                    for photog in Photographer.objects.filter(
                        cover_picture__media__isnull=False
                    ).distinct()
                ],
                pictures=[],
                breadcrumb=[
                    Album.objects.get(path="/")._make_breadcrumb(),
                ],
                redirect_url="",
                is_downloadable=False,
                download_url="",
                date="",
                layout="simple",
                credits={},
            )
        )


class PhotographerApiV3View(View):
    http_method_names = ["get", "head"]

    def get(self, request, photographer_slug):
        try:
            photographer = Photographer.objects.get(slug=photographer_slug)
        except Photographer.DoesNotExist:
            # Fallback to album view on 404 to allow info pages like /photographers/privacy
            return api_v3_view(request, path=f"/photographers/{photographer_slug}")

        return JsonResponse(photographer.make_album())


class RandomPictureAPIV3View(View):
    http_method_names = ["get", "head"]

    def get(self, request):
        picture = Picture.get_random_picture()

        if picture:
            response = JsonResponse(
                Album.fake_album_as_dict(
                    path="/random",
                    title="Random Picture",
                    redirect_url=picture.path,
                )
            )
        else:
            response = JsonResponse(
                {"status": 404, "message": "the server has no photos :("},
                status_code=404,
            )

        response["Cache-Control"] = "no-store"

        return response


class ContactRequest(pydantic.BaseModel):
    context: str = pydantic.Field(min_length=1)
    email: pydantic.EmailStr
    subject: Literal["permission", "takedown", "other"]
    message: str = pydantic.Field(min_length=1)

    subject_map: ClassVar[dict[str, str]] = dict(
        permission="Usage permission inquiry",
        takedown="Takedown request",
        other="Contact request",
    )

    def send(self, request: HttpRequest | None = None):
        album = Album.get_album_by_path(self.context)

        if isinstance(album, Series):
            # fmh
            raise Album.DoesNotExist()

        if not album.photographer or not album.photographer.has_email:
            raise Photographer.DoesNotExist()

        site_name = Album.objects.get(path="/").title
        subject_display = self.subject_map.get(self.subject, self.subject_map["other"])
        context_display = f"{settings.EDEGAL_FRONTEND_URL}{self.context}"

        vars = dict(
            site_name=site_name,
            context=context_display,
            email=self.email,
            subject=subject_display,
            message=self.message,
        )

        body = render_to_string("contact_email.txt", vars, request)

        if settings.DEBUG:
            print(body)

        # send email to album.photographer.email
        EmailMessage(
            subject=f"[{site_name}] {subject_display} ({self.context})",
            body=body,
            reply_to=[self.email],
            to=[album.photographer.email],
        ).send()


class ContactView(View):
    http_method_names = ["post"]

    def post(self, request):
        try:
            contact_request = ContactRequest.model_validate_json(request.body)
        except pydantic.ValidationError as e:
            logger.error("Invalid contact request (failed to validate)", exc_info=e)
            return JsonResponse(
                {"status": 400, "message": "Invalid request"},
                status=400,
            )

        try:
            contact_request.send(request)
        except Album.DoesNotExist as e:
            logger.error(
                "Invalid contact request (context refers to a nonexistent picture or album)",
                exc_info=e,
            )
            return JsonResponse(
                {"status": 400, "message": "Invalid request"},
                status=400,
            )
        except Photographer.DoesNotExist as e:
            logger.error(
                "Invalid contact request (album has no photographer or photographer has no email)",
                exc_info=e,
            )
            return JsonResponse(
                {"status": 400, "message": "Invalid request"},
                status=400,
            )

        return JsonResponse({"status": 200, "message": "OK"})


api_v3_view = ApiV3View.as_view()
photographers_api_v3_view = PhotographersApiV3View.as_view()
photographer_api_v3_view = PhotographerApiV3View.as_view()
random_picture_api_v3_view = RandomPictureAPIV3View.as_view()
status_view = StatusView.as_view()
contact_view = csrf_exempt(ContactView.as_view())
