# TUANET Web Prototype

Прототип сайта уже подключается к локальному backend и подходит для живой проверки аккаунтного флоу.

## Что уже работает

- `login/register` через email
- привязка Telegram через `link_session`
- обзор аккаунта из backend
- устройства, платежи, профиль и безопасность на живых данных
- страница подписки как live billing/promo snapshot
- модальное пополнение баланса через YooKassa redirect flow
- страница ключей как живые ссылки доступа устройств

## Быстрый запуск

1. Скопируй `.env.example` в `.env.local`
2. Убедись, что backend запущен из `../workspace` на `http://127.0.0.1:8002`
3. Для production-like схемы задай одинаковый `TUANET_INTERNAL_BACKEND_API_KEY` и на backend, и на сервере сайта
4. Запусти сайт:

```bash
npm run dev
```

5. Открой [http://localhost:3000/login](http://localhost:3000/login)

## Деплой через GitHub (Docker + GHCR)

Этот проект использует Next.js server features (route handlers в `src/app/api`, `next/headers`, server-side cookies), поэтому **GitHub Pages (статический хостинг) сюда не подходит** без отдельной адаптации под static export.

В репозитории уже настроен деплой через GitHub Actions: сборка Docker-образа и публикация в GitHub Container Registry (GHCR).

### 1) Подготовить репозиторий

1. Создай репозиторий на GitHub и запушь код.
2. Убедись, что основная ветка называется `main` (workflow триггерится на `push` в `main`).

### 2) Дождаться сборки

Workflow: `.github/workflows/ghcr.yml`.

После первого `push` в `main` появится образ:

- `ghcr.io/<owner>/<repo>:latest`
- `ghcr.io/<owner>/<repo>:sha-<...>`

### 3) Запустить на сервере

Пример:

```bash
docker pull ghcr.io/<owner>/<repo>:latest
docker run --rm -p 3000:3000 \
  -e TUANET_BACKEND_URL="http://127.0.0.1:8002" \
  -e TUANET_INTERNAL_BACKEND_API_KEY="..." \
  -e TUANET_COOKIE_SECURE="true" \
  ghcr.io/<owner>/<repo>:latest
```

## Рекомендованный тестовый сценарий

1. Зарегистрируй новый email-аккаунт на сайте
2. Открой `/account/profile` и привяжи Telegram
3. После подтверждения в боте обнови `/account`
4. Проверь:
   - `/account`
   - `/account/devices`
   - `/account/keys`
   - `/account/payments`
   - `/account/subscription`

## Переменные окружения

### Сайт / Next.js

- `TUANET_BACKEND_URL` — адрес FastAPI backend для server-side запросов
- `TUANET_INTERNAL_BACKEND_API_KEY` — внутренний server-to-server ключ, который сайт отправляет в backend
- `TUANET_COOKIE_SECURE` — включает `secure` для auth-cookie, в production должен быть `true`
- `TUANET_MAIN_HOST` / `TUANET_PARTNER_HOST` / `TUANET_ADMIN_HOST` — server-side host routing под домены
- `NEXT_PUBLIC_TUANET_MAIN_HOST` / `NEXT_PUBLIC_TUANET_PARTNER_HOST` / `NEXT_PUBLIC_TUANET_ADMIN_HOST` — client-side host routing
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — username Telegram-бота для deep-link привязки

### Backend / FastAPI

- `DATABASE_URL` — база данных, живёт только на backend-сервере
- `JWT_SECRET_KEY` — подпись access token, живёт только на backend-сервере
- `TUANET_INTERNAL_BACKEND_API_KEY` — тот же внутренний ключ, что и у сайта
- `TUANET_REQUIRE_INTERNAL_BACKEND_API_KEY` — принудительное требование ключа на backend; в production лучше `true`
- `TUANET_INTERNAL_BACKEND_HEADER` — опционально меняет имя заголовка для внутреннего ключа
- `YOOKASSA_SHOP_ID` — shop ID тестового или продового магазина YooKassa
- `YOOKASSA_SECRET_KEY` — секретный ключ магазина YooKassa
- `YOOKASSA_API_URL` — базовый адрес API YooKassa, по умолчанию `https://api.yookassa.ru/v3`

## YooKassa тестовый поток

- сайт вызывает только свои Next route handlers `/api/payments/topups`
- Next-сервер сам общается с backend через внутренний ключ
- backend создаёт redirect-платёж в YooKassa и хранит локальный `payment_ref`
- после возврата YooKassa пользователь попадает обратно на `/account/subscription`
- webhook для YooKassa должен указывать на backend: `/webhooks/yookassa`
# tuanet
