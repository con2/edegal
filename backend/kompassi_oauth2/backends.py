from django.contrib.auth.models import User, Group
from django.conf import settings


def user_attrs_from_kompassi(kompassi_user):
    return dict((django_key, accessor_func(kompassi_user)) for (django_key, accessor_func) in [
        ('username', lambda u: u['username']),
        ('email', lambda u: u['email']),
        ('first_name', lambda u: u['first_name']),
        ('last_name', lambda u: u['surname']),
        ('is_superuser', lambda u: settings.KOMPASSI_ADMIN_GROUP in u['groups']),
        ('is_staff', lambda u: settings.KOMPASSI_EDITOR_GROUP in u['groups']),
        ('groups', lambda u: [Group.objects.get_or_create(name=group_name)[0] for group_name in u['groups']]),
    ])


class KompassiOAuth2AuthenticationBackend(object):
    def authenticate(self, oauth2_session=None, **kwargs):
        if oauth2_session is None:
            # Not ours (password login)
            return None

        response = oauth2_session.get(settings.KOMPASSI_API_V2_USER_INFO_URL)
        response.raise_for_status()
        kompassi_user = response.json()

        # Non-editor users may not log in via OAuth2
        if settings.KOMPASSI_EDITOR_GROUP not in kompassi_user['groups']:
            return None

        user, created = User.objects.get_or_create(username=kompassi_user['username'])

        for key, value in user_attrs_from_kompassi(kompassi_user).iteritems():
            setattr(user, key, value)

        user.save()

        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesDotExist:
            return None
