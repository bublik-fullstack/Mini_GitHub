"""WSGI-приложение (для gunicorn/uWSGI)."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mini_github.settings")

application = get_wsgi_application()
