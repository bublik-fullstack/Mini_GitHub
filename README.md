# Mini GitHub

Простой сервис для хранения кода и совместной работы над проектом — как GitHub, но миниатюрный.  
Написан на Django, работает в Docker-контейнерах, хранит данные в PostgreSQL,  
распределяет фоновые задачи через Redis + Celery.

---

## Зачем это нужно

Представь, что ты и твои друзья хотите вместе писать проект, но:
- Куда-то кидать код, чтобы не терять версии?
- Кто-то должен проверять, что код не сломался (CI)?
- Чтобы можно было оставлять комментарии и задачи (issues)?
- Чтобы можно было ставить звёзды и видеть, кто ими ставит?

Вот для этого иexists Mini GitHub. Он не заменяет настоящий GitHub — он учит, как устроена такая система изнутри.

---

## Как это устроено (простыми словами)

### 1. Куда пишется код

Когда ты загружаешь файлы в репозиторий, они не складываются просто так.  
Система делает **снимок** — полный список всех файлов на этот момент.  
Это как фотка, а не набор изменений. Так проще и быстрее найти, что было в конкретном коммите.

Каждый файл хранится по-своему **SHA256-хешу** — это как отпечаток пальца контента.  
Один и тот же файл (одинаковое содержимое) лежит на диске только один раз.  
Экономит место и делает хранение умным.

### 2. История коммитов

Коммит — это точка в истории, где:
- Есть сообщение (что изменилось)
- Есть родительский коммит (откуда пришли)
- Есть полный снимок файлов

Чтобы посмотреть историю, не нужно перебирать все предыдущие коммиты —  
достаточно сделать обычный запрос к базе данных по нужному коммиту.

### 3. Фоновые задачи (Celery)

Некоторые вещи не хочется делать прямо сейчас, когда пользователь ждёт ответ.  
Поэтому они уходят в фон:

- **Пересчёт размера репозитория** — после каждого коммита
- **Запуск мини-CI** — проверка, проходит ли код проверку синтаксиса
- **Уборка мусора** — раз в сутки удаляются файлы, которые никому не нужны

### 4. Кэширование (Redis)

Часто запрашиваемые данные (список репозиторий, дерево файлов, история коммитов)  
хранятся в оперативной памяти через Redis.  
Когда что-то меняется — кэш Invalidate и следующий запрос берёт свежие данные.

### 5. Безопасность и права доступа

- Каждый пользователь — свой аккаунт с паролем
- JWT-токены (access/refresh) управляют сессиями
- Репозитории могут быть публичными или приватными
- Права проверяются через отдельные классы (CanReadRepo, CanWriteRepo),  
  чтобы не писать проверки в каждом view

---

## Технологии

| Что | Зачем |
|-----|-------|
| Django 5/6 | Фреймворк, основа всего проекта |
| Django REST Framework | REST API |
| PostgreSQL 16 | Основная база данных |
| Redis 7 | Кэш и брокер для Celery |
| Celery | Фоновые задачи |
| Gunicorn | Production-сервер для API |
| Docker + docker-compose | Удобная запускаемость одной командой |

---

## Быстрый старт

### 1. Подготовь окружение

Скопируй шаблон с настройками:

```bash
cp .env.example .env
```

В `.env` можно оставить значения по умолчанию — они подойдут для локальной разработки.

### 2. Запусти проект

```bash
docker compose up --build
```

Эта команда:
- Соберёт контейнеры
- Запустит PostgreSQL, Redis, API и Celery-воркера
- Накатит миграции автоматически
- Откроет API на `http://localhost:8000/api`

### 3. Остановка

```bash
docker compose down -v
```

Удалит контейнеры, базу данных и хранилище блобов.

---

## Демо: как пользоваться API

Все запросы делаем по `http://localhost:8000/api`.

### Регистрация

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123","password2":"secret123","email":"a@x.com"}'
```

### Вход (получаем токен)

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}' | \
  python -c "import sys,json;print(json.load(sys.stdin)['access'])")
```

Теперь токен есть в переменной `$TOKEN`. Добавим его в заголовок:

```bash
AUTH="Authorization: Bearer $TOKEN"
```

### Создаём репозиторий

```bash
curl -X POST http://localhost:8000/api/repos \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name":"demo","description":"моё первый репо","is_private":false}'
```

### Загружаем файлы (это создаёт коммит)

```bash
echo "print('hello world')" > main.py
curl -X POST http://localhost:8000/api/repos/alice/demo/files \
  -H "$AUTH" \
  -F "message=первый коммит" \
  -F "files=@main.py"
```

### Смотрим историю коммитов

```bash
curl -s http://localhost:8000/api/repos/alice/demo/commits \
  -H "$AUTH"
```

### Дерево файлов

```bash
curl -s http://localhost:8000/api/repos/alice/demo/tree \
  -H "$AUTH"
```

### Скачиваем конкретный файл

```bash
curl -s http://localhost:8000/api/repos/alice/demo/contents/main.py?ref=head \
  -H "$AUTH"
```

### Детали коммита (включая diff)

```bash
SHA=<вставьте sha из предыдущего шага>
curl -s http://localhost:8000/api/repos/alice/demo/commits/$SHA \
  -H "$AUTH"
```

### Мини-CI: добавляем `.minici.yaml` и меняем код

```bash
printf 'steps:\n  - name: syntax check\n    run: python -m py_compile main.py\n' > .minici.yaml
echo "print('hello world!')" > main.py
curl -X POST http://localhost:8000/api/repos/alice/demo/files \
  -H "$AUTH" \
  -F "message= добавить CI" \
  -F "files=@.minici.yaml" \
  -F "files=@main.py"
```

Через несколько секунд можно проверить, прошёл ли CI:

```bash
curl -s http://localhost:8000/api/repos/alice/demo/pipelines \
  -H "$AUTH"
```

### Создаём issue и комментируем

```bash
curl -X POST http://localhost:8000/api/repos/alice/demo/issues \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"title":"Баг","body":"что-то падает"}'

curl -X POST http://localhost:8000/api/repos/alice/demo/issues/1/comments \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"body":"поддерживаю, воспроизводится"}'

curl -X PATCH http://localhost:8000/api/repos/alice/demo/issues/1 \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"status":"closed"}'
```

### Ставим звезду

```bash
curl -X PUT http://localhost:8000/api/repos/alice/demo/star \
  -H "$AUTH"

curl -s http://localhost:8000/api/repos/alice/demo/stargazers \
  -H "$AUTH"
```

---

## Полный список API

| Метод | Путь | Описание | Кто может |
|-------|------|----------|-----------|
| POST | `/auth/register` | Регистрация | все |
| POST | `/auth/token` | Получить JWT | все |
| POST | `/auth/token/refresh` | Обновить JWT | все |
| GET | `/auth/me` | Свой профиль | авторизованный |
| POST | `/repos` | Создать репозиторий | авторизованный |
| GET | `/repos` | Список моих репозиториев | авторизованный |
| GET | `/users/{username}/repos` | Репо пользователя | все (приватные — владелец) |
| GET/PATCH/DELETE | `/repos/{owner}/{name}` | Детали / правка / удаление | как у репо |
| PUT/DELETE | `/repos/{owner}/{name}/star` | Звезда / убрать звезду | авторизованный |
| GET | `/repos/{owner}/{name}/stargazers` | Кто поставил звезду | как у репо |
| POST | `/repos/{owner}/{name}/files` | Загрузить файлы (коммит) | владелец |
| DELETE | `/repos/{owner}/{name}/files/{path}` | Удалить файл (коммит) | владелец |
| GET | `/repos/{owner}/{name}/commits` | История коммитов | как у репо |
| GET | `/repos/{owner}/{name}/commits/{sha}` | Коммит + diff | как у репо |
| GET | `/repos/{owner}/{name}/tree` | Дерево файлов | как у репо |
| GET | `/repos/{owner}/{name}/contents/{path}` | Скачать файл | как у репо |
| GET/POST | `/repos/{owner}/{name}/issues` | Issue: список / создать | как у репо |
| GET/PATCH | `/repos/{owner}/{name}/issues/{number}` | Issue: детали / закрыть | автор или владелец |
| GET/POST | `/repos/{owner}/{name}/ issues/{number}/comments` | Комментарии | как у репо |
| GET | `/repos/{owner}/{name}/pipelines` | Прогоны CI | как у репо |
| GET | `/repos/{owner}/{name}/pipelines/{pk}` | Детали прогона CI | как у репо |

### Коды ответов

| Код | Значение |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Создано (регистрация, коммит, issue) |
| 400 | Ошибка валидации |
| 401 | Не авторизован |
| 403 | Нет прав |
| 404 | Не найдено / приватный репо для чужого |
| 409 | Пустой коммит / дубликат репозитория |

---

## Как устроен проект (дерево файлов)

```
mini_github/            — Django-проект (settings, celery, urls, wsgi)
core/                   — общие сервисы: cache, locks, validators, pagination
accounts/               — User, регистрация, JWT, /me
repositories/           — repo + файлы + коммиты + CI
issues/                 — issue + комментарии
frontend/               — React + TypeScript клиент
Dockerfile              — образ API
docker-compose.yml      — оркестрация всех сервисов
docker-entrypoint.sh    — запуск миграций + gunicorn
.env.example            — шаблон переменных окружения
README.md               — эта документация
```

### Профили настроек

Проект поддерживает три профиля, чтобы можно было запускать его по-разному:

| Профиль | Где используется | База данных | Кэш | DEBUG |
|---------|-----------------|-------------|-----|-------|
| `local` | Локально без Docker | SQLite | В памяти | Да |
| `dev` | Разработка в Docker | PostgreSQL | Redis | Да |
| `prod` | Продакшн | PostgreSQL | Redis | Нет |

Переключение происходит через переменную окружения `DJANGO_SETTINGS_MODULE`.

---

## Ограничения и предупреждения

### Мини-CI без песочницы

Шаги из `.minici.yaml` выполняются **прямо в окружении воркера Celery**,  
без изоляции и с таймаутом 30 секунд на шаг.  
Это намеренно упрощено для учебного проекта.

В реальной системе шаги нужно запускать в отдельном контейнере  
с ограничениями по ресурсам, времени и сети.

### Хранилище блобов

Файлы репозитория хранятся на диске в папке `storage/`,  
которая монтируется как том. Она не входит в гит-репозиторий (закрыта `.gitignore`).

### Настройки по умолчанию

В `settings/base.py` **нет слабых fallback-значений** для секретов:
- `SECRET_KEY` — должна быть задана явно через переменную окружения
- `POSTGRES_PASSWORD` — должна быть задана явно
- `ALLOWED_HOSTS` — пустой список по умолчанию (отклоняет все хосты)

Это сознательный выбор: если что-то не настроено, система должна падать,  
а не работать с небезопасными значениями.

---

## Требования

- Docker и docker-compose
- Python 3.10+
- Оперативная память: минимум 2 ГБ
- Свободный порт 8000

---

## Автор

bublik-fullstack

---

## 7. Фронтенд (React + TypeScript)

Одностраничное приложение для работы с API — в папке `frontend/`.

### Стек

| Что | Зачем |
|-----|-------|
| React 19 | UI-библиотека |
| TypeScript | Строгая типизация |
| Vite | Сборщик и dev-сервер |
| React Router | Клиентский роутинг |
| Axios | HTTP-клиент с JWT-интерсепторами |

### Возможности

- JWT-аутентификация (вход, регистрация, автообновление токена)
- Просмотр репозиториев
- Дерево файлов с навигацией по директориям
- Просмотр содержимого файлов
- История коммитов с diff
- Issues и комментарии
- Прогоны CI
- Тёмная тема в стиле GitHub

### Запуск

```bash
cd frontend
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:5173`.

По умолчанию API ожидается на `http://localhost:8000/api`.
Чтобы изменить — создайте файл `frontend/.env`:

```
VITE_API_BASE=http://localhost:8000/api
```

### Сборка

```bash
cd frontend
npm run build
```

Результат попадёт в `frontend/dist/`.

### Структура

```
frontend/
├── src/
│   ├── api/          API-клиент (axios, JWT-интерсепторы)
│   ├── components/   Переиспользуемые компоненты
│   │   ├── Header.tsx
│   │   ├── RepoCard.tsx
│   │   ├── FileTree.tsx
│   │   └── DiffViewer.tsx
│   ├── pages/        Страницы
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── RepoDetail.tsx
│   ├── types/        TypeScript-интерфейсы
│   ├── App.tsx       Роутинг
│   └── main.tsx      Точка входа
├── package.json
├── tsconfig.json
└── vite.config.ts
```