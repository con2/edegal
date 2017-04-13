from hashlib import sha256 as hash_function
import logging

from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _

from ..utils import pick_attrs


logger = logging.getLogger(__name__)


def compute_hash(text):
    return hash_function(text.encode('UTF-8')).hexdigest()


class DedupMixin(object):
    @classmethod
    def get_or_create(cls, text, **defaults):
        the_hash = compute_hash(text)

        try:
            return cls.objects.get_or_create(
                digest=the_hash,
                defaults=dict(
                    text=text,
                    **defaults
                )
            )
        except cls.MultipleObjectsReturned:
            logger.warn('Multiple %s returned for hash %s', cls.__name__, the_hash)
            return cls.objects.filter(digest=the_hash, text=text).first(), False


class TermsAndConditions(models.Model, DedupMixin):
    digest = models.CharField(
        max_length=len(compute_hash('')),
        verbose_name=_('Digest'),
        help_text=_('Used for de-duplication. Kindly please do not change.'),
    )

    text = models.TextField(
        blank=True,
        default='',
        verbose_name=_('Terms and conditions text'),
        help_text=_(
            'Keep this short enough to fit in a small modal dialog and use the URL field for '
            'full license text.'
        ),
    )

    is_public = models.BooleanField(
        default=True,
        verbose_name=_('Public'),
        help_text=_(
            'Public T&Cs can be selected by any user at upload time. Use public T&Cs for eg. '
            'Creative Commons licenses, "All Rights Reserved" and other common situations. '
            'Private T&Cs can only be selected by the owner.'
        ),
    )

    url = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name=_('License URL'),
        help_text=_(
            'If these terms and conditions refer to a publicly known content license, such as '
            'Creative Commons, please link to it here.'
        ),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True)

    def admin_get_abridged_text(self, max_chars=80):
        if len(self.text) <= max_chars:
            return self.text
        else:
            return self.text[:max_chars] + '…'
    admin_get_abridged_text.short_description = _('Text')
    admin_get_abridged_text.admin_order_field = 'text'

    def as_dict(self):
        return pick_attrs(self,
            'text',
            'url',
        )

    class Meta:
        verbose_name = _('Terms and conditions')
        verbose_name_plural = _('Terms and conditions')
