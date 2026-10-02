# 🤖 ReviewPulse — AI Code Reviewer for Pull Requests & Snippets

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000000.svg?style=flat-for-the-badge&logo=vercel)](https://ai-code-reviewer-eight-vert.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black.svg)](https://nextjs.org/)
[![Fastify/Express](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange.svg)](https://zustand-demo.pmnd.rs/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2d3748.svg)](https://www.prisma.io/)

> **ReviewPulse** — это production-ready сервис для автоматизированного анализа Pull Request'ов и сниппетов исходного кода на базе AI с гарантированно структурированным JSON-ответом (Structured Outputs), многоуровневым обнаружением уязвимостей, оценкой качества кода и генерацией готовых патчей.  
> 🌐 **Попробовать в работе:** [ai-code-reviewer-eight-vert.vercel.app](https://ai-code-reviewer-eight-vert.vercel.app/)  
> Интерфейс спроектирован в минималистичном дизайне в стиле **Linear / Vercel** с тёмной темой по умолчанию, плавной анимацией и моноширинной типографикой.

---

## 🌟 Ключевые возможности

* **Двухпанельный сплит-интерфейс (Linear / Vercel Style):**
  * **Левая панель (Input):**
    * Селектор 12 языков программирования (*Python, TypeScript, Go, Rust, Java, C++, C#, PHP, Ruby, SQL, Shell*).
    * Селектор фокуса ревью: *Безопасность (Security), Производительность (Performance), Чистота кода (Clean Code), Предотвращение багов (Bug Prevention), Архитектура (Architecture)*.
    * Редактор кода с синхронизированной нумерацией строк, поддержкой отступов по `Tab`, счетчиком строк/символов и горячей клавишей запуска **`⌘ + Enter`** / **`Ctrl + Enter`**.
    * Быстрые пресеты реальных уязвимостей (SQL-инъекции, утечки памяти в React, deadlock горутин в Go, паники в Rust).
  * **Правая панель (Output / Dashboard):**
    * Круговой анимированный спидометр/гейдж общего рейтинга кода (Score 0-100) с цветовой индикацией:
      * 🟢 **85–100**: *Production Ready* (Высокое качество)
      * 🟡 **60–84**: *Needs Refactoring* (Требует оптимизации)
      * 🔴 **0–59**: *Critical Vulnerabilities* (Критические дефекты)
    * Фильтрация проблем по уровням критичности: *All, Critical, Warning, Suggestion*.
    * Карточки проблем с цветовой полосой, бейджем номера строки (`Line 42`), детальным объяснением причины бага и блоком готового патча.
    * Интерактивные кнопки **«Copy Patch»** и **«Apply to Editor»**.
    * Экспорт ревью в виде форматированного Markdown-комментария для GitHub PR / GitLab MR или скачивание в JSON.

* **Архитектура Backend (Service-Oriented):**
  * Разделение на **Routes**, **Controllers**, **Middlewares** и **Services**.
  * **AI Provider Factory:**
    * **OpenAI Provider:** Structured Outputs через `response_format: { type: "json_schema" }` или JSON Mode.
    * **Anthropic Provider:** Claude 3.5 Sonnet с валидацией схемы.
    * **Intelligent Heuristic Engine (Mock):** Встроенный статический анализатор кода с эвристиками AST для мгновенного локального тестирования без обязательного указания API ключей (Zero-config).
  * **Служебные Middleware:**
    * `requestLogger`: цветное логирование запросов, статус-кодов, IP и задержки.
    * `apiRateLimiter`: лимитирование запросов (`express-rate-limit`) с заголовками `RateLimit-*` и RFC-ответом 429.
    * `errorHandler`: централизованный перехват ошибок Zod (400), таймаутов (504), сбоев upstream LLM (502).
  * **База данных & ORM:**
    * Схема `Prisma ORM` с моделями `User`, `Review`, `Issue` для PostgreSQL.

---

## 📐 Архитектурная схема

```mermaid
graph TD
    User([Разработчик / Браузер]) <-->|Next.js 16 UI / Split-Screen| Frontend[Frontend: Next.js + Tailwind + Zustand]
    Frontend -->|POST /api/v1/review/analyze| Backend[Backend API: Express + TypeScript]
    
    subgraph Backend Pipeline
        Backend --> MW_RateLimit[Rate Limiter Middleware: 30 req/min]
        MW_RateLimit --> MW_Logger[Logger Middleware]
        MW_Logger --> ReviewController[ReviewController]
        ReviewController --> ZodValidator{Zod Schema Validator}
        
        ZodValidator -->|Valid| ReviewService[ReviewService]
        ZodValidator -->|Invalid| ErrorHandler[Error Handler: 400 Bad Request]
        
        ReviewService --> LLMFactory[LLM Provider Factory]
        LLMFactory -->|If OpenAI Key| OpenAI[OpenAI Provider: GPT-4o JSON Schema]
        LLMFactory -->|If Claude Key| Anthropic[Anthropic Provider: Claude 3.5]
        LLMFactory -->|Default / Fallback| HeuristicMock[Heuristic AST Engine: Local Mock]
        
        ReviewService -.->|Optional Persistence| PrismaORM[(PostgreSQL / Prisma)]
    end

    HeuristicMock --> ReviewService
    OpenAI --> ReviewService
    Anthropic --> ReviewService
    ReviewService --> ReviewController
    ReviewController --> Frontend

📂 Структура проекта

project#1/
├── backend/                  # Backend API сервис (Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma     # PostgreSQL Prisma схема (User, Review, Issue)
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts            # Валидация переменных окружения через Zod
│   │   ├── controllers/
│   │   │   └── review.controller.ts # Контроллер обработки ревью и пресетов
│   │   ├── middlewares/
│   │   │   ├── errorHandler.middleware.ts  # Централизованная обработка ошибок
│   │   │   ├── logger.middleware.ts        # Структурированное логирование запросов
│   │   │   └── rateLimiter.middleware.ts   # Rate Limiting (лимиты запросов)
│   │   ├── routes/
│   │   │   ├── health.routes.ts     # GET /api/v1/health
│   │   │   ├── review.routes.ts     # POST /api/v1/review/analyze
│   │   │   └── index.ts             # Монтирование API v1
│   │   ├── schemas/
│   │   │   └── review.schema.ts     # Zod-схемы запроса и ответа
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── base.provider.ts      # Интерфейс провайдера ILLMProvider
│   │   │   │   ├── openai.provider.ts    # Провайдер OpenAI Structured Outputs
│   │   │   │   ├── anthropic.provider.ts # Провайдер Claude 3.5 Sonnet
│   │   │   │   ├── mock.provider.ts      # Эвристический анализатор AST
│   │   │   │   ├── prompts.ts            # Специализированные системные промпты
│   │   │   │   └── llm.factory.ts        # Фабрика выбора провайдера
│   │   │   └── review.service.ts         # Бизнес-логика ревью и история
│   │   ├── types/
│   │   │   └── review.types.ts           # Строгие TypeScript типы
│   │   └── server.ts                     # Запуск Express с Graceful Shutdown
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                 # Frontend приложение (Next.js 16 App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/review/route.ts  # Next.js Route Handler (прокси к бэкенду)
│   │   │   ├── globals.css          # Тёмная тема, скроллбары, токены Prism
│   │   │   ├── layout.tsx           # Корневой лейаут с SEO-метаданными
│   │   │   └── page.tsx             # Главный сплит-экран
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   └── CodeEditorPanel.tsx         # Редактор кода с нумерацией строк
│   │   │   ├── history/
│   │   │   │   └── HistoryDrawer.tsx           # Боковая панель истории ревью
│   │   │   ├── layout/
│   │   │   │   └── Header.tsx                  # Верхняя панель Linear/Vercel
│   │   │   ├── review/
│   │   │   │   ├── EmptyReviewState.tsx        # Приветственный экран
│   │   │   │   ├── ExportModal.tsx             # Экспорт в PR Markdown / JSON
│   │   │   │   ├── FilterBar.tsx               # Фильтрация по критичности
│   │   │   │   ├── IssueCard.tsx               # Карточка проблемы с патчем
│   │   │   │   ├── ReviewDashboardPanel.tsx    # Панель вывода результатов
│   │   │   │   └── ScoreGauge.tsx              # Круговой гейдж рейтинга
│   │   │   └── settings/
│   │   │       └── SettingsModal.tsx           # Настройки LLM и ввод API-ключей
│   │   ├── lib/
│   │   │   ├── api-client.ts        # Клиент вызова API с обработкой таймаутов
│   │   │   ├── presets.ts           # Пресеты кода для быстрого тестирования
│   │   │   └── utils.ts             # Вспомогательные утилиты и буфер обмена
│   │   ├── store/
│   │   │   └── useReviewStore.ts    # Zustand Store с сохранением в localStorage
│   │   └── types/
│   │       └── review.types.ts      # Типизация интерфейса
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── package.json                    # Корневой package.json для одновременного запуска
└── README.md

🚀 Быстрый старт
Требования

    Node.js: v18.0.0 или новее (рекомендуется v20+)

    npm или pnpm

1. Установка всех зависимостей

Выполните из корневой директории:
Bash

npm run install:all

2. Запуск приложения

Для одновременного запуска Backend (порт 4000) и Frontend (порт 3000):
Bash

npm run dev

Или запускайте сервисы раздельно в разных терминалах:

    Backend:
    Bash

    npm run dev:backend

    Frontend:
    Bash

    npm run dev:frontend

Откройте в браузере http://localhost:3000 или воспользуйтесь живым демо: ai-code-reviewer-eight-vert.vercel.app :)
🔑 Конфигурация API Ключей (Опционально)

По умолчанию сервис не требует никаких API-ключей и работает "из коробки", используя интеллектуальный статический эвристический анализатор (Mock Heuristic Engine). Он мгновенно находит реальные уязвимости.

Если вы хотите подключить GPT-4o или Claude 3.5 Sonnet:

    Либо укажите ключи в файле backend/.env:
    Фрагмент кода

    OPENAI_API_KEY="sk-..."
    ANTHROPIC_API_KEY="sk-ant-..."
    DEFAULT_LLM_PROVIDER="auto"

    Либо прямо в веб-интерфейсе нажмите иконку шестерёнки (Settings) в правом верхнем углу и вставьте свой ключ. Ключ сохранится в локальном хранилище вашего браузера.

📡 API Спецификация
1. Анализ кода

POST /api/v1/review/analyze

Тело запроса (Request Body):
JSON

{
  "code": "import sqlite3\n\ndef get_user(uid):\n    cursor.execute(\"SELECT * FROM users WHERE id = \" + uid)",
  "language": "python",
  "focus": "security",
  "provider": "auto"
}

Успешный ответ (200 OK):
JSON

{
  "summary": "Review identified 1 critical vulnerability(ies) that block deployment. Remediation is required to prevent security exploits.",
  "score": 65,
  "issues": [
    {
      "severity": "critical",
      "line": 4,
      "title": "SQL Injection Vulnerability",
      "description": "Dynamic SQL query constructed via direct string concatenation or interpolation.",
      "patch": "cursor.execute(\"SELECT * FROM users WHERE id = %s\", (user_id,))"
    }
  ],
  "metadata": {
    "provider": "Heuristic Engine (Mock)",
    "model": "heuristic-analyzer-v1",
    "processingTimeMs": 457,
    "linesOfCode": 4,
    "criticalCount": 1,
    "warningCount": 0,
    "suggestionCount": 0
  }
}

2. Проверка здоровья (Health Check)

GET /api/v1/health
JSON

{
  "status": "healthy",
  "timestamp": "2026-10-02T08:14:00.000Z",
  "uptimeSeconds": 120,
  "providers": {
    "openai": false,
    "anthropic": false,
    "mock": true
  },
  "version": "1.0.0"
}

🗄️️ База данных (Prisma ORM)

В архитектуре заложена поддержка PostgreSQL для сохранения истории ревью и командных воркспейсов:
Фрагмент кода

model User {
  id      String   @id @default(uuid())
  email   String   @unique
  reviews Review[]
}

model Review {
  id          String   @id @default(uuid())
  codeSnippet String   @db.Text
  language    String
  focus       String
  summary     String   @db.Text
  score       Int
  issues      Issue[]
}

model Issue {
  id          String   @id @default(uuid())
  reviewId    String
  severity    String   // 'critical' | 'warning' | 'suggestion'
  line        Int
  title       String
  description String   @db.Text
  patch       String   @db.Text
}

🛡️ Безопасность и надёжность

    Rate Limiting: Защита от спама и DoS (до 30 запросов в минуту на IP с заголовком Retry-After).

    Error Boundary: Все ошибки валидации, таймауты и сбои LLM-провайдеров перехватываются централизованным обработчиком.

    Строгая типизация: Полное покрытие TypeScript со строгим режимом (strict: true), валидация через zod.

📄 Лицензия

MIT. Спроектировано и реализовано с упором на чистую архитектуру, эстетику Linear/Vercel и высокую производительность :)