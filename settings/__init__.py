"""Корневой модуль настроек: выбираем профиль через ENV=dev|prod."""
import os

env = os.getenv("DJANGO_ENV", "dev")

if env == "prod":
    from .prod import *  # noqa: F401,F403
elif env == "local":
    from .local import *  # noqa: F401,F403
else:
    from .dev import *  # noqa: F401,F403
