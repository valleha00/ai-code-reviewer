# 🤖 ReviewPulse — AI Code Reviewer for Pull Requests & Snippets

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000.svg?style=flat-for-the-badge&logo=vercel)](https://ai-code-reviewer-eight-vert.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black.svg)](https://nextjs.org/)
[![Fastify/Express](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2d3748.svg)](https://www.prisma.io/)

> **ReviewPulse** is a production-ready AI-powered service for automated Pull Request and code snippet analysis. It guarantees structured JSON outputs, multi-level vulnerability detection, code quality assessment, and generates ready-to-use patches.  
> 🌐 **Live Demo:** [ai-code-reviewer-eight-vert.vercel.app](https://ai-code-reviewer-eight-vert.vercel.app/)  

---

![ReviewPulse Demo](./docs/demo.gif)

---

## 🌟 Key Features

* **Two-Panel Split Interface:**
  * **Input Panel:** Select from 12 programming languages, choose a review focus (Security, Performance, Clean Code), use the code editor with syntax highlighting, and test real-world vulnerability presets (SQLi, memory leaks).
  * **Output Panel:** Circular code quality score gauge (0-100), severity-based issue filtering, interactive issue cards with ready-to-use patches, and quick export to Markdown for PRs.
* **Backend Architecture:**
  * Built-in static analyzer (Heuristic AST Mock) allows testing out-of-the-box without API keys.
  * Integration with OpenAI (GPT-4o) and Anthropic (Claude 3.5 Sonnet) via Structured Outputs.
  * Middleware for structured logging and Rate Limiting.
  * PostgreSQL database support via Prisma ORM.

---

## 📐 Architecture Diagram

```mermaid
flowchart TD
    User["Developer / Browser"] --> Frontend["Frontend: Next.js 16"]
    Frontend --> Backend["Backend: Express API"]

    subgraph Pipeline["Backend Pipeline"]
        Backend --> RateLimit["Rate Limiter (30 req/min)"]
        RateLimit --> Logger["Logger Middleware"]
        Logger --> Controller["Review Controller"]
        Controller --> Validator{"Zod Schema Validator"}
        
        Validator -->|Valid| Service["Review Service"]
        Validator -->|Invalid| ErrorHandler["Error Handler (400)"]
        
        Service --> LLMFactory["LLM Provider Factory"]
        LLMFactory --> OpenAI["OpenAI GPT-4o"]
        LLMFactory --> Anthropic["Anthropic Claude 3.5"]
        LLMFactory --> Mock["Heuristic AST Mock"]
        
        Service --> Prisma["Prisma ORM / PostgreSQL"]
    end

    Mock --> Service
    OpenAI --> Service
    Anthropic --> Service
    Service --> Controller
    Controller --> Frontend
```

---

## 📂 Project Structure

```text
project#1/
├── backend/                  # Backend API service (Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma     # PostgreSQL Prisma schema
│   ├── src/
│   │   ├── config/           # Environment variables validation
│   │   ├── controllers/      # Review and preset controllers
│   │   ├── middlewares/      # Error handler, logger, Rate Limit
│   │   ├── routes/           # API v1 routing
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic and LLM providers
│   │   ├── types/            # TypeScript strict types
│   │   └── server.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Frontend application (Next.js 16)
│   ├── src/
│   │   ├── app/              # App Router, global styles, Layout
│   │   ├── components/       # UI components (Editor, Dashboard, Cards)
│   │   ├── lib/              # API clients and utilities
│   │   ├── store/            # Zustand state manager
│   │   └── types/            # Frontend interfaces
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

---

## 🚀 Quick Start

### Requirements
* Node.js v18.0.0+ (v20+ recommended)
* npm or pnpm

### Running the Application
Install all dependencies from the root directory:
```bash
npm run install:all
```

Start the Backend (port 4000) and Frontend (port 3000) simultaneously:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔑 API Key Configuration (Optional)

The service works out-of-the-box using a built-in heuristic analyzer. If you want to connect real LLM providers:

1. Add your keys to the `backend/.env` file:
   ```env
   OPENAI_API_KEY="sk-..."
   ANTHROPIC_API_KEY="sk-ant-..."
   DEFAULT_LLM_PROVIDER="auto"
   ```
2. Or configure them directly in the web UI by clicking the **Settings** icon. The key is securely stored in your browser's Local Storage.

---

## 📡 API Specification

### Code Analysis
`POST /api/v1/review/analyze`

**Request Body:**
```json
{
  "code": "import sqlite3\n\ndef get_user(uid):\n    cursor.execute(\"SELECT * FROM users WHERE id = \" + uid)",
  "language": "python",
  "focus": "security",
  "provider": "auto"
}
```

**Response (200 OK):**
```json
{
  "summary": "Review identified critical vulnerabilities. Remediation is required.",
  "score": 65,
  "issues": [
    {
      "severity": "critical",
      "line": 4,
      "title": "SQL Injection",
      "description": "Dynamic SQL query constructed via direct string concatenation.",
      "patch": "cursor.execute(\"SELECT * FROM users WHERE id = %s\", (user_id,))"
    }
  ],
  "metadata": {
    "provider": "Heuristic Engine (Mock)",
    "processingTimeMs": 457
  }
}
```

---

## 🗄️️ Database

The architecture includes PostgreSQL support for storing review history and team workspaces:

```prisma
model User {
  id      String   @id @default(uuid())
  email   String   @unique
  reviews Review[]
}

model Review {
  id          String   @id @default(uuid())
  codeSnippet String   @db.Text
  language    String
  score       Int
  issues      Issue[]
}

model Issue {
  id          String   @id @default(uuid())
  reviewId    String
  severity    String
  line        Int
  title       String
  patch       String   @db.Text
}
```

---

## 📄 License
MIT. Designed for high performance and clean aesthetics :)