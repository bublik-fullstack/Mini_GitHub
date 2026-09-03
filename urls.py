"""Корневой URL-роутер проекта."""
from django.contrib import admin
from django.urls import include, path

from mini_github.views import api_root, home

urlpatterns = [
    path("", home, name="home"),
    path("api/", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    # Оба приложения монтируются под /api/. У них непересекающиеся под-пути:
    # repositories отвечает за /api/repos и /api/users, issues — за вложенные /issues.
    path("api/", include("repositories.urls")),
    path("api/", include("issues.urls")),
]
