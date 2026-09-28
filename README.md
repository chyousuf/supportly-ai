# Supportly AI — AI Customer Support Platform

A modern, full-stack AI customer support platform that helps businesses answer customer questions using their approved website content, product information, FAQs, and policies. When the assistant cannot answer confidently, it offers a human handoff.

Built for **WordPress**, **WooCommerce**, **Shopify**, and **Webflow** websites.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | PHP 8.2+ / Laravel 11 |
| **Frontend** | TypeScript / React 18 / Vite |
| **Styling** | Tailwind CSS 3 |
| **Database** | MySQL 8 |
| **Auth** | Laravel Sanctum (token-based) |
| **AI** | OpenAI API (optional, with keyword fallback) |
| **Widget** | Standalone TypeScript → compiled JS via esbuild |

## Features

### Landing Page
- Animated hero with interactive chat preview
- Working interactive demo with pre-built responses
- Feature cards, integration strip, pricing, FAQ accordion
- Smooth scroll-triggered animations (respects `prefers-reduced-motion`)
- Fully responsive (mobile, tablet, desktop)

### Customer Dashboard
- **Overview** — Conversation stats, volume chart, recent activity
- **Inbox** — Conversation list with filters, message thread, agent reply, notes, handoff controls
- **Knowledge Base** — Add/edit/delete FAQs, URLs, documents; test questions against sources
- **Widget Customizer** — Brand colors, name, welcome message, position, suggested questions with live preview
- **Integrations** — Embed code for WordPress, Shopify, Webflow with copy-to-clipboard
- **Analytics** — Top questions, unanswered questions, feedback breakdown
- **Settings** — Business profile, team members, notifications, data privacy, AI provider config

### Embeddable Chat Widget
- Standalone JavaScript file (no dependencies)
- Auto-initializes from `<script>` tag with `data-business-id`
- Mobile-responsive, keyboard accessible, screen reader friendly
- Typing indicators, source citations, feedback buttons
- Human handoff form with privacy notice
- Business hours awareness
- Session persistence across page navigations

### AI Behavior
- Answers grounded in approved knowledge sources only
- Never invents policies, prices, or product availability
- Keyword-based matching (no API key required) or OpenAI integration
- Human handoff when it cannot help
- Source citations on every answer

## Prerequisites

- **PHP** 8.2+ with extensions: `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer** 2.x
- **Node.js** 18+
- **MySQL** 8.x
- **npm** 9+

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Create MySQL database
mysql -u root -e "CREATE DATABASE supportly_ai;"

# Update .env with your database credentials
# DB_DATABASE=supportly_ai
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations and seed demo data
php artisan migrate --seed

# Start the development server
php artisan serve
# → Backend running at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → Frontend running at http://localhost:5173
```

### 3. Widget Build (Optional)

```bash
cd widget

# Install dependencies
npm install

# Build the widget
npm run build
# → Outputs to backend/public/widget/supportly-widget.js
```

### 4. Open the App

- **Landing Page**: http://localhost:5173
- **Demo Login**: `demo@northstargoods.com` / `demo123`
- **Dashboard**: http://localhost:5173/dashboard

## Project Structure

```
supportly-ai/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── AnalyticsController.php
│   │   │   ├── ConversationController.php
│   │   │   ├── KnowledgeSourceController.php
│   │   │   ├── SettingsController.php
│   │   │   └── WidgetController.php
│   │   ├── Models/             # Eloquent models (7)
│   │   ├── Services/           # AI & search services
│   │   └── Middleware/         # Auth & tenant isolation
│   ├── config/                 # Laravel configuration
│   ├── database/
│   │   ├── migrations/         # 8 migration files
│   │   └── seeders/            # Demo data seeder
│   ├── routes/api.php          # API route definitions
│   └── public/widget/          # Compiled widget JS
│
├── frontend/                   # React + TypeScript + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.tsx  # Full landing page (1200+ lines)
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── dashboard/      # 7 dashboard pages
│       ├── components/         # Layout, protected route
│       ├── contexts/           # Auth & toast contexts
│       ├── hooks/              # useInView custom hook
│       ├── types/              # TypeScript interfaces
│       └── utils/              # API client
│
├── widget/                     # Embeddable chat widget
│   ├── src/supportly-widget.ts # Widget source (~800 lines)
│   ├── build.js                # esbuild config
│   └── tsconfig.json
│
└── package.json                # Root scripts
```

## API Endpoints

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create business account |
| POST | `/api/auth/login` | Login, receive token |

### Widget (Public, Rate Limited)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widget/{id}/config` | Get widget configuration |
| POST | `/api/widget/{id}/conversations` | Start conversation |
| POST | `/api/widget/{id}/conversations/{cid}/messages` | Send message, get AI response |
| POST | `/api/widget/{id}/conversations/{cid}/handoff` | Request human handoff |
| POST | `/api/widget/{id}/conversations/{cid}/feedback` | Submit feedback |

### Dashboard (Auth Required)
Knowledge base CRUD, conversation management, analytics, settings, team management — see `routes/api.php` for full list.

## Environment Variables

```env
# Required
APP_KEY=             # Generated by php artisan key:generate
DB_DATABASE=supportly_ai
DB_USERNAME=root
DB_PASSWORD=

# Frontend
FRONTEND_URL=http://localhost:5173

# Optional - AI Integration
OPENAI_API_KEY=      # Leave empty to use keyword matching
OPENAI_MODEL=gpt-4o-mini
```

## Embedding the Widget

Add this to any website before `</body>`:

```html
<script src="http://your-domain.com/widget/supportly-widget.js"
        data-business-id="YOUR_BUSINESS_ID"></script>
```

## What's Fully Functional

- ✅ Landing page with all sections and interactive demo
- ✅ User registration and authentication
- ✅ Knowledge base CRUD (FAQs, URLs, documents)
- ✅ Knowledge base testing (ask questions, see matched sources)
- ✅ Widget customization with live preview
- ✅ Embeddable chat widget
- ✅ AI responses using keyword matching (no API key needed)
- ✅ AI responses via OpenAI (when API key provided)
- ✅ Source citations on answers
- ✅ Human handoff workflow
- ✅ Conversation inbox with agent reply
- ✅ Tenant isolation (multi-business)
- ✅ Analytics overview with demo data
- ✅ Team member management
- ✅ Toast notifications and form validation

## What Requires Additional Setup

- ⏳ **OpenAI integration** — Add `OPENAI_API_KEY` to `.env` for AI-powered responses
- ⏳ **Native WordPress plugin** — Currently uses embed code; plugin scaffolding planned
- ⏳ **Native Shopify app** — Currently uses embed code
- ⏳ **Email notifications** — Requires mail service configuration
- ⏳ **File upload processing** — Document text extraction (PDF/DOCX parsing)
- ⏳ **URL content fetching** — Automatic content scraping from URLs
- ⏳ **Real-time updates** — WebSocket/SSE for live conversation updates

## License

MIT
