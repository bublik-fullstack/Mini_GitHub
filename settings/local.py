"""Локальный профиль для запуска без Docker (SQLite + LocMem-кэш).

Используется только для демонстрации/разработки на этой машине. В Docker
применяется профиль dev/prod с PostgreSQL и Redis (см. .env.example).
Задачи Celery выполняются синхронно (ALWAYS_EAGER), поэтому пересчёт размера
и мини-CI отрабатывают прямо при коммите — удобно для smoke-теста.
"""
import os

from .base import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

STORAGE_ROOT = os.path.join(BASE_DIR, "storage")

# Локально брокер не нужен: задачи исполняются синхронно в том же процессе.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+locmem://"
