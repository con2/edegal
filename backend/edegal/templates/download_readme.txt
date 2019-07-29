{{ album.title }}
{{ album.get_absolute_url }}

{% if album.photographer %}Kuvaaja/Photographer: {{ album.photographer }}{% endif %}
{% if album.director %}Ohjaaja/Director: {{ album.director }}{% endif %}
