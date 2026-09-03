"""Базовые настройки проекта «Mini GitHub».

Все чувствительные параметры берутся из переменных окружения (см. .env.example).
Локально переменные можно положить в .env — он подгружается через python-dotenv.
"""
import os

from dotenv import load_dotenv

load_dotenv()

# ── Общие ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-change-me")
DEBUG = os.getenv("DEBUG", "0") == "1"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Контентно-адресуемое хранилище блобов (на томе, вне БД)
STORAGE_ROOT = os.getenv("STORAGE_ROOT", os.path.join(BASE_DIR, "storage"))

# ── Приложения ───────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",

    "accounts",
    "repositories",
    "issues",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "mini_github.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ]},
    },
]

WSGI_APPLICATION = "mini_github.wsgi.application"

# ── База данных (PostgreSQL 16) ───────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "minigithub"),
        "USER": os.getenv("POSTGRES_USER", "minigithub"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "minigithub"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# ── Кэш (Redis 7 через django-redis) ──────────────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("REDIS_URL", "redis://redis:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # таймаут по умолчанию для кэшируемых ключей — 15 минут
            "SOCKET_TIMEOUT": 5,
            "CONNECTION_POOL_KWARGS": {"health_check_interval": 30},
            # pickle-сериализатор — кладём в кэш произвольные python-объекты (в т.ч. datetime).
            "SERIALIZER": "django_redis.serializers.pickle.PickleSerializer",
        },
    }
}

# ── Auth / кастомный пользователь ────────────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 6}},
]

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        # Базовый уровень — только аутентифицированные; тонкая настройка в views.
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.pagination.DefaultPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "core.permissions.custom_exception_handler",
}

# ── JWT (simplejwt) ───────────────────────────────────────────────────────────
from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── Celery (фоновые задачи + beat) ────────────────────────────────────────────
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TIMEZONE = "UTC"
# Периодические задачи: раз в сутки запускаем GC осиротевших блобов.
CELERY_BEAT_SCHEDULE = {
    "gc-orphan-blobs-daily": {
        "task": "repositories.tasks.gc_orphan_blobs",
        "schedule": timedelta(days=1),
    },
}

# Лимиты для диффа и загрузок
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(5 * 1024 * 1024)))  # 5 МБ на файл
MAX_FILES_PER_COMMIT = int(os.getenv("MAX_FILES_PER_COMMIT", "50"))
DIFF_MAX_LINES = 1000  # файлы длиннее — помечаем "too_large"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
