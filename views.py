"""Корневые view: редирект с / на /api и JSON-оглавление всех эндпоинтов.

Проект — REST API без HTML-фронта, поэтому вместо 404 по корню отдаём
понятное меню маршрутов. Авторизованные маршруты в браузере всё равно
потребуют Bearer-токен (его браузер не шлёт) — для них используйте curl/Postman.
"""
from django.http import HttpResponseRedirect, JsonResponse


def api_root(request):
    """GET /api/ — JSON-оглавление эндпоинтов."""
    data = {
        "service": "Mini GitHub API",
        "note": "Для авторизованных маршрутов нужен заголовок "
                "'Authorization: Bearer <access_token>'.",
        "auth": {
            "register": "POST /api/auth/register",
            "token": "POST /api/auth/token",
            "token_refresh": "POST /api/auth/token/refresh",
            "me": "GET /api/auth/me",
        },
        "repositories": {
            "list_create": "GET/POST /api/repos",
            "user_repos": "GET /api/users/{username}/repos",
            "detail": "GET/PATCH/DELETE /api/repos/{owner}/{name}",
            "star": "PUT/DELETE /api/repos/{owner}/{name}/star",
            "stargazers": "GET /api/repos/{owner}/{name}/stargazers",
            "upload_files": "POST /api/repos/{owner}/{name}/files",
            "delete_file": "DELETE /api/repos/{owner}/{name}/files/{path}",
            "commits": "GET /api/repos/{owner}/{name}/commits",
            "commit_detail": "GET /api/repos/{owner}/{name}/commits/{sha}",
            "tree": "GET /api/repos/{owner}/{name}/tree?ref=head|{sha}",
            "contents": "GET /api/repos/{owner}/{name}/contents/{path}?ref=head|{sha}",
            "pipelines": "GET /api/repos/{owner}/{name}/pipelines",
            "pipeline_detail": "GET /api/repos/{owner}/{name}/pipelines/{pk}",
        },
        "issues": {
            "list_create": "GET/POST /api/repos/{owner}/{name}/issues",
            "detail": "GET/PATCH /api/repos/{owner}/{name}/issues/{number}",
            "comments": "GET/POST /api/repos/{owner}/{name}/issues/{number}/comments",
        },
    }
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False, "indent": 2})


def home(request):
    """GET / — редирект на /api/ (оглавление)."""
    return HttpResponseRedirect("/api/")
