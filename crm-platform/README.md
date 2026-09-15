# BoostFlow — No-Code CRM Platform

Повнофункціональна CRM-платформа з динамічною структурою даних, автоматизацією без коду та вбудованим AI-асистентом. Юзер сам визначає модулі й поля своєї CRM — система не диктує фіксовану схему "Ліди/Угоди/Контакти", а будується під конкретний бізнес.

## Можливості

- **Auth** — email/пароль з верифікацією, OAuth (Google, GitHub), httpOnly refresh-токени з CSRF-захистом
- **Workspace** — мультитенантність, запрошення, ролі й permissions, передача власності
- **Metadata** — динамічні модулі та поля 13 типів (текст, число, select, файл, зв'язок тощо)
- **Records** — CRUD з валідацією проти схеми полів, розширені фільтри (AND/OR, gt/lt/contains), збережені views
- **Automation** — конструктор workflow (trigger → conditions → actions) через чергу Redis/BullMQ
- **AI** — генератор форм і workflow з опису природною мовою (Gemini API), read-only чат-асистент по даних workspace
- **Files** — завантаження в S3-сумісне сховище (MinIO/Cloudflare R2), прикріплення до записів
- **Activity & Comments** — таймлайн подій запису, коментарі зі згадками (`@mentions`) і нотифікаціями
- **Search** — глобальний пошук (⌘K) по модулях і записах

## Стек

**Backend:** NestJS, PostgreSQL + Prisma 7, Redis + BullMQ, MinIO/S3, Gemini API, Pino (структуровані логи)
**Frontend:** Next.js (App Router), TanStack Query, React Hook Form + Zod, Tailwind CSS
**Інфраструктура:** Docker Compose, GitHub Actions CI/CD, Jest (unit + e2e)

## Архітектура
crm-platform/
├── back-end/ NestJS API
│ ├── src/
│ │ ├── core/ Prisma, Storage, AI, Queue — інфраструктурні сервіси
│ │ ├── modules/ бізнес-домени (auth, workspace, metadata, records, workflow, ai, files, comments, notifications)
│ │ └── common/ guards, decorators, middleware, filters
│ ├── prisma/ schema.prisma + migrations
│ └── test/ e2e-тести (Auth, Workspace, Records, Automation, AI)
├── front-end/ Next.js застосунок
│ └── src/
│ ├── app/ роути (App Router)
│ ├── components/ доменні компоненти
│ ├── shared/UI/ примітиви дизайн-системи
│ └── lib/ API-клієнти
└── docker-compose.yml

Детальніше про бекенд-архітектуру — у `back-end/architecture.md` і `back-end/database.md`.

## Локальний запуск

### Передумови
- Node.js 20+
- Docker Desktop

### 1. Клонуй і встанови залежності

```bash
git clone <repo-url>
cd crm-platform/back-end && npm install
cd ../front-end && npm install
```

### 2. Підніми інфраструктуру (Postgres, Redis, MinIO)

```bash
cd ..
docker compose up -d postgres redis minio
```

### 3. Налаштуй `.env`

```bash
cd back-end
cp .env.example .env
```

Заповни секрети: `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (32+ символів), `GEMINI_API_KEY` ([aistudio.google.com](https://aistudio.google.com/apikey)), `RESEND_API_KEY` ([resend.com](https://resend.com)), OAuth credentials (опційно).

### 4. Застосуй міграції

```bash
npx prisma migrate deploy
```

### 5. Запусти обидва застосунки

```bash
# у back-end/
npm run start:dev

# у front-end/ (окремий термінал)
npm run dev
```

Бекенд: `http://localhost:3000` (Swagger: `/api/docs`)
Фронтенд: `http://localhost:3001`

## Тестування

```bash
cd back-end
npm run test          # unit
npm run db:test:push  # застосувати схему до тестової БД
npm run test:e2e      # e2e (Auth, Workspace, Records, Automation, AI)
npm run lint
```

## Docker (повний стек)

```bash
docker compose up --build
```

Автоматично застосовує міграції (`prisma migrate deploy`) при старті контейнера.

## CI/CD

`.github/workflows/ci.yml` — lint, Prisma validation, unit-тести, e2e (з реальним Postgres/Redis у GitHub Actions), build. Деплой — Render (backend) + Neon (Postgres) + Cloudflare R2 (файли), з auto-deploy після проходження CI.

## Безпека

- Helmet, суворий CORS allowlist, rate limiting (глобальний + окремий ліміт на auth-ендпоінти)
- httpOnly refresh-токени + double-submit CSRF cookie
- Валідація env-змінних при старті (Joi), мінімальна довжина JWT-секретів
- Redact чутливих полів (паролі, токени) у структурованих логах