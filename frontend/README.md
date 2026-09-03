# Mini GitHub Frontend

React + TypeScript клиент для API [Mini GitHub](https://github.com/bublik-fullstack/Mini_GitHub).

## Стек

- React 19
- TypeScript
- Vite
- React Router
- Axios

## Возможности

- Авторизация (JWT)
- Просмотр репозиториев
- Дерево файлов с навигацией
- Просмотр содержимого файлов
- История коммитов с diff
- Issues и комментарии
- Прогоны CI

## Запуск

```bash
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:5173`.

Для работы с API установите переменную окружения:

```bash
VITE_API_BASE=http://localhost:8000/api
```

## Сборка

```bash
npm run build
```

## Структура

```
src/
├── api/          # API-клиент (axios)
├── components/   # Переиспользуемые компоненты
├── pages/        # Страницы
├── types/        # TypeScript-интерфейсы
└── App.tsx       # Роутинг
```
