```markdown

<div align="right">

&#x20; <a href="./README.md">English</a> | <strong>Русский</strong>

</div>



\# 🤖 ReviewPulse — AI Code Reviewer for Pull Requests \& Snippets



\[!\[Live Demo](https://img.shields.io/badge/Live\_Demo-Vercel-000000.svg?style=flat-for-the-badge\&logo=vercel)](https://ai-code-reviewer-eight-vert.vercel.app/)

\[!\[TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

\[!\[Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black.svg)](https://nextjs.org/)

\[!\[Fastify/Express](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-green.svg)](https://expressjs.com/)

\[!\[Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)

\[!\[Prisma](https://img.shields.io/badge/ORM-Prisma%206-2d3748.svg)](https://www.prisma.io/)



> \*\*ReviewPulse\*\* — это production-ready сервис для автоматизированного анализа Pull Request'ов и сниппетов исходного кода на базе AI с гарантированно структурированным JSON-ответом, многоуровневым обнаружением уязвимостей и генерацией готовых патчей.  

> 🌐 \*\*Live Demo:\*\* \[ai-code-reviewer-eight-vert.vercel.app](https://ai-code-reviewer-eight-vert.vercel.app/)  



!\[ReviewPulse Demo](./docs/demo.gif)



\---



\## 🌟 Ключевые возможности



\* \*\*Двухпанельный сплит-интерфейс:\*\*

&#x20; \* \*\*Input Panel:\*\* Выбор из 12 языков программирования, настройка фокуса ревью (Security, Performance, Clean Code), редактор кода с подсветкой и пресеты реальных уязвимостей (SQLi, утечки памяти).

&#x20; \* \*\*Output Panel:\*\* Круговой спидометр рейтинга качества кода (0-100), фильтрация проблем по критичности, карточки с готовыми патчами и возможностью быстрого экспорта в PR.

\* \*\*Backend Архитектура:\*\*

&#x20; \* Встроенный статический анализатор (Heuristic AST Mock) для работы "из коробки" без ключей.

&#x20; \* Интеграция с OpenAI (GPT-4o) и Anthropic (Claude 3.5 Sonnet) через Structured Outputs.

&#x20; \* Middleware для логирования и Rate Limiting (лимит запросов).

&#x20; \* Поддержка PostgreSQL через Prisma ORM.



\---



\## 📐 Архитектурная схема



```mermaid

flowchart TD

&#x20;   User\["Разработчик / Браузер"] --> Frontend\["Frontend: Next.js 16"]

&#x20;   Frontend --> Backend\["Backend: Express API"]



&#x20;   subgraph Pipeline\["Backend Pipeline"]

&#x20;       Backend --> RateLimit\["Rate Limiter (30 req/min)"]

&#x20;       RateLimit --> Logger\["Logger Middleware"]

&#x20;       Logger --> Controller\["Review Controller"]

&#x20;       Controller --> Validator{"Zod Schema Validator"}

&#x20;       

&#x20;       Validator -->|Valid| Service\["Review Service"]

&#x20;       Validator -->|Invalid| ErrorHandler\["Error Handler (400)"]

&#x20;       

&#x20;       Service --> LLMFactory\["LLM Provider Factory"]

&#x20;       LLMFactory --> OpenAI\["OpenAI GPT-4o"]

&#x20;       LLMFactory --> Anthropic\["Anthropic Claude 3.5"]

&#x20;       LLMFactory --> Mock\["Heuristic AST Mock"]

&#x20;       

&#x20;       Service --> Prisma\["Prisma ORM / PostgreSQL"]

&#x20;   end



&#x20;   Mock --> Service

&#x20;   OpenAI --> Service

&#x20;   Anthropic --> Service

&#x20;   Service --> Controller

&#x20;   Controller --> Frontend



📂 Структура проекта

Plaintext



project#1/

├── backend/                  # Backend API сервис (Express + TypeScript)

│   ├── prisma/

│   │   └── schema.prisma     # PostgreSQL Prisma схема

│   ├── src/

│   │   ├── config/           # Валидация переменных окружения

│   │   ├── controllers/      # Контроллеры обработки ревью

│   │   ├── middlewares/      # Обработка ошибок, логгер, Rate Limit

│   │   ├── routes/           # Маршрутизация API v1

│   │   ├── schemas/          # Zod-схемы валидации

│   │   ├── services/         # Бизнес-логика и LLM-провайдеры

│   │   ├── types/            # TypeScript типы

│   │   └── server.ts         # Запуск сервера

│   ├── package.json

│   └── tsconfig.json

│

├── frontend/                 # Frontend приложение (Next.js 16)

│   ├── src/

│   │   ├── app/              # App Router, глобальные стили, Layout

│   │   ├── components/       # UI компоненты (Editor, Dashboard, Карточки)

│   │   ├── lib/              # API клиенты и утилиты

│   │   ├── store/            # Zustand стейт-менеджер

│   │   └── types/            # Интерфейсы Frontend

│   ├── package.json

│   └── tailwind.config.ts

│

└── README.md



🚀 Быстрый старт

Требования



&#x20;   Node.js v18.0.0+ (рекомендуется v20+)



&#x20;   npm или pnpm



Запуск приложения



Выполните из корневой директории установку зависимостей:

Bash



npm run install:all



Для одновременного запуска Backend (порт 4000) и Frontend (порт 3000):

Bash



npm run dev



Откройте в браузере http://localhost:3000.

🔑 Конфигурация API Ключей (Опционально)



Сервис работает "из коробки" с использованием встроенного эвристического анализатора. Если вы хотите подключить настоящие LLM:



&#x20;   Укажите ключи в файле backend/.env:

&#x20;   Фрагмент кода



&#x20;   OPENAI\_API\_KEY="sk-..."

&#x20;   ANTHROPIC\_API\_KEY="sk-ant-..."

&#x20;   DEFAULT\_LLM\_PROVIDER="auto"



&#x20;   Или укажите ключ прямо в веб-интерфейсе, нажав на иконку настроек (Settings). Ключ будет сохранен локально в браузере.



📡 API Спецификация

Анализ кода



POST /api/v1/review/analyze



Request Body:

JSON



{

&#x20; "code": "import sqlite3\\n\\ndef get\_user(uid):\\n    cursor.execute(\\"SELECT \* FROM users WHERE id = \\" + uid)",

&#x20; "language": "python",

&#x20; "focus": "security",

&#x20; "provider": "auto"

}



Response (200 OK):

JSON



{

&#x20; "summary": "Review identified critical vulnerabilities. Remediation is required.",

&#x20; "score": 65,

&#x20; "issues": \[

&#x20;   {

&#x20;     "severity": "critical",

&#x20;     "line": 4,

&#x20;     "title": "SQL Injection",

&#x20;     "description": "Dynamic SQL query constructed via direct string concatenation.",

&#x20;     "patch": "cursor.execute(\\"SELECT \* FROM users WHERE id = %s\\", (user\_id,))"

&#x20;   }

&#x20; ],

&#x20; "metadata": {

&#x20;   "provider": "Heuristic Engine (Mock)",

&#x20;   "processingTimeMs": 457

&#x20; }

}



🗄️ База данных



Архитектура поддерживает PostgreSQL для хранения истории ревью:

Фрагмент кода



model User {

&#x20; id      String   @id @default(uuid())

&#x20; email   String   @unique

&#x20; reviews Review\[]

}



model Review {

&#x20; id          String   @id @default(uuid())

&#x20; codeSnippet String   @db.Text

&#x20; language    String

&#x20; score       Int

&#x20; issues      Issue\[]

}



model Issue {

&#x20; id       String   @id @default(uuid())

&#x20; reviewId String

&#x20; severity String

&#x20; line     Int

&#x20; title    String

&#x20; patch    String   @db.Text

}



📄 Лицензия



MIT. Спроектировано для высокой производительности и эстетики.

