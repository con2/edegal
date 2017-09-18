# encoding: utf-8

from django.http import HttpResponse
from django.views.generic import View
from django.shortcuts import redirect
from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login

from requests_oauthlib import OAuth2Session


def get_session(request, **kwargs):
    return OAuth2Session(settings.KOMPASSI_OAUTH2_CLIENT_ID,
        redirect_uri=request.build_absolute_uri(reverse('oauth2_callback_view')),
        scope=settings.KOMPASSI_OAUTH2_SCOPE,  # XXX hardcoded scope
        **kwargs
    )


class LoginView(View):
    def get(self, request):
        authorization_url, state = get_session(request).authorization_url(settings.KOMPASSI_OAUTH2_AUTHORIZATION_URL)
        request.session['oauth_state'] = state
        request.session['oauth_next'] = request.GET.get('next', None)
        return redirect(authorization_url)


LOGIN_FAILED = """
<p>Sisäänkirjautuminen Kompassin kautta epäonnistui. Todennäköisesti tämä johtuu siitä, että sinulla
ei ole oikeutta sivuston muokkaamiseen.</p>
<p>Mikäli sinulla tulisi mielestäsi olla muokkausoikeus, ota yhteyttä Japsuun.</p>
"""


class CallbackView(View):
    def get(self, request):
        if 'oauth_state' not in request.session or 'oauth_next' not in request.session:
            return HttpResponse('OAuth2 callback accessed outside OAuth2 authorization flow', status=400)

        session = get_session(request, state=request.session['oauth_state'])
        session.fetch_token(settings.KOMPASSI_OAUTH2_TOKEN_URL,
            client_secret=settings.KOMPASSI_OAUTH2_CLIENT_SECRET,
            authorization_response=request.build_absolute_uri(),
        )

        next_url = request.session['oauth_next']

        del request.session['oauth_state']
        del request.session['oauth_next']

        user = authenticate(oauth2_session=session)
        if user is not None and user.is_active and user.is_staff:
            login(request, user)
            return redirect(next_url if next_url else '/')
        else:
            return HttpResponse(LOGIN_FAILED, status=401)
