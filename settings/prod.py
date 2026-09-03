"""Настройки для продакшена (наследуют base, усиливают безопасность)."""
from .base import *  # noqa: F401,F403

DEBUG = False
# В docker-compose пробрасываем явный список хостов через окружение.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
