"""Инициализация Celery. Импортируется в воркере и в Django-приложении."""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mini_github.settings")

app = Celery("mini_github")
# Конфигурация берётся из настроек Django (префикс CELERY_ не нужен, т.к. явно задали).
app.config_from_object("django.conf:settings", namespace="CELERY")
# Автообнаружение задач во всех приложениях.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"debug_task вызвана на {self.request.id}")
