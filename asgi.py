"""ASGI-приложение (для демонстрации; Celery работает отдельным воркером)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mini_github.settings")

application = get_asgi_application()
