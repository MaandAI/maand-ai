# 🌙 Maand — AI-Powered Mental Health Platform

> **Maand** is a full-stack, clinical-grade AI mental health web application built with Next.js 16. It combines real-time emotion detection, RAG-enhanced AI therapy chat, structured therapy modules, avatar-based sessions, immersive grounding exercises, video therapy sessions, and a comprehensive admin management system.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features Overview](#-features-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Database Seeding](#-database-seeding)
- [User Roles & Access Control](#-user-roles--access-control)
- [Core Functionalities](#-core-functionalities)
  - [AI Chat (RAG + AI)](#1-ai-chat-rag--ai)
  - [Emotion Detection](#2-emotion-detection)
  - [Therapy Modules](#3-therapy-modules)
  - [Avatar Customization](#4-avatar-customization)
  - [Immersive Grounding Exercises](#5-immersive-grounding-exercises)
  - [Video Therapy Sessions](#6-video-therapy-sessions)
  - [Mood Check-in & Goals](#7-mood-check-in--goals)
  - [Reports & Analytics](#8-reports--analytics)
  - [Notifications](#9-notifications)
  - [Admin Panel](#10-admin-panel)
  - [Authentication & Security](#11-authentication--security)
  - [Legacy Profile](#12-legacy-profile)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Seed Credentials](#-seed-credentials)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Radix UI + shadcn/ui |
| **Database** | MongoDB (via Mongoose) |
| **Authentication** | NextAuth.js v4 (Credentials + Google OAuth) |
| **AI — Generative** | Google Generative AI (via Google AI Studio) |
| **AI — Embeddings** | HuggingFace sentence-transformers/all-MiniLM-L6-v2 |
| **AI — Emotion** | HuggingFace SamLowe/roberta-base-go_emotions |
| **AI — Vision** | MediaPipe Tasks (face landmark & gesture recognition) |
| **RAG** | Custom disk-cached vector store (cosine similarity) |
| **Video Calls** | Daily.co (@daily-co/daily-js) |
| **File Storage** | Cloudinary |
| **Email** | Resend |
| **PDF Export** | jsPDF + @react-pdf/renderer |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **State Management** | Zustand + TanStack Query |
| **Forms** | React Hook Form + Zod |

---

## ✨ Features Overview

- 🤖 **AI Therapy Chat** with RAG context retrieval and real-time emotion detection
- 🧠 **Structured Therapy Modules** (CBT, DBT, Mindfulness, etc.) with progress tracking
- 🎭 **Avatar Builder** — customize your therapy companion
- 🌿 **Immersive Grounding Exercises** (breathing, 5-4-3-2-1 grounding, panic calm-down)
- 📹 **Video Therapy Sessions** with Daily.co integration
- 📊 **Mood Tracking & Analytics** with trend visualization
- 🎯 **Goal Setting & Tracking**
- 📄 **Downloadable PDF Reports** (mental health outcome scores)
- 🔔 **Real-time Notifications**
- 🛡️ **Crisis Detection** with emergency escalation
- 👤 **Multi-role System** (User, Admin)
- 🔐 **Two-Factor Authentication (2FA)**
- 📝 **Audit Logging** for security compliance
- 🧬 **Legacy Profile** — a digital well-being legacy journal

---

## 📁 Project Structure

```
maand/
├── app/
│   ├── (marketing)/        # Public landing, about, pricing, contact pages
│   ├── (auth)/             # Login, signup, forgot/reset password, verify email
│   ├── (dashboard)/        # Protected user dashboard
│   │   └── dashboard/
│   │       ├── page.tsx        # Main dashboard overview
│   │       ├── therapy/        # AI chat, therapy sessions, video
│   │       ├── modules/        # Therapy modules catalogue & progress
│   │       ├── avatar/         # Avatar customization page
│   │       ├── immersive/      # Grounding & breathing exercises
│   │       ├── reports/        # PDF mental health reports
│   │       ├── sessions/       # Session history
│   │       ├── notifications/  # Notification center
│   │       ├── billing/        # Billing & subscription
│   │       ├── profile/        # User profile management
│   │       └── settings/       # App settings
│   ├── (admin)/            # Protected admin panel
│   │   └── admin/
│   │       ├── page.tsx        # Admin overview
│   │       ├── users/          # User management
│   │       ├── therapists/     # Therapist management
│   │       ├── analytics/      # Platform analytics
│   │       └── settings/       # Admin settings
│   ├── auth/               # 2FA verification page
│   ├── onboarding/         # New user onboarding flow
│   └── api/                # API routes
│       ├── chat/           # AI chat endpoint
│       ├── auth/           # NextAuth handlers
│       ├── dashboard/      # Dashboard data
│       ├── goals/          # Goal CRUD
│       ├── health/         # Health check
│       ├── modules/        # Therapy modules
│       ├── notifications/  # Notification management
│       ├── reports/        # Report generation
│       ├── therapy/        # Therapy session management
│       ├── user/           # User profile APIs
│       ├── users/          # Admin user management
│       ├── therapist/      # Therapist-specific APIs
│       ├── video-sessions/ # Video call management
│       ├── admin/          # Admin-only APIs
│       └── legacy/         # Legacy profile APIs
├── components/
│   ├── admin/              # Admin panel components
│   ├── auth/               # Auth form components
│   ├── avatar/             # Avatar builder UI
│   ├── common/             # Shared UI primitives
│   ├── dashboard/          # Dashboard widgets & layout
│   ├── features/           # Marketing feature sections
│   ├── marketing/          # Landing page sections
│   ├── providers/          # React context providers
│   ├── reports/            # Report components
│   ├── therapy/            # Therapy UI (chat, exercises, mood)
│   └── ui/                 # shadcn/ui component library
├── models/                 # Mongoose models
├── services/
│   ├── rag/                # RAG retrieval service + knowledge base
│   └── *.service.ts        # Domain services (chat, user, therapy, etc.)
├── backend/                # Backend services, validators, middleware
├── lib/                    # Auth config, DB connection, utilities
├── middleware.ts            # Route protection & RBAC
├── scripts/
│   ├── seed.ts             # Database seeder
│   └── check-db.js         # DB connection checker
└── types/                  # TypeScript type definitions
```

---

## 🔧 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x or **pnpm** >= 9.x (recommended)
- **MongoDB** — a running instance or [MongoDB Atlas](https://cloud.mongodb.com) cluster

---

## 🔑 Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials:

```env
# Authentication (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -hex 32"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Database (MongoDB)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/maand?retryWrites=true&w=majority"

# Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="Maand <noreply@maand.tech>"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# AI APIs
AI_API_KEY="your_generative_ai_api_key_here"
HUGGINGFACE_API_KEY="your_huggingface_api_key_here"

# Security & Encryption
ENCRYPTION_KEY="64_char_hex_key: openssl rand -hex 32"
```

### Where to get API Keys

| Service | URL |
|---|---|
| Google AI Studio (Generative AI) | https://aistudio.google.com/apikey |
| HuggingFace | https://huggingface.co/settings/tokens |
| Google OAuth | https://console.cloud.google.com/apis/credentials |
| MongoDB Atlas | https://cloud.mongodb.com |
| Resend (Email) | https://resend.com |
| Cloudinary | https://cloudinary.com/console |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SalmanNawaz921/maand-ai.git
cd maand-ai
```

### 2. Install dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 4. Verify database connection (optional)

```bash
node scripts/check-db.js
```

### 5. Seed the database

```bash
npm run seed
```

### 6. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## 🌱 Database Seeding

The seed script populates the database with demo data including users, therapy modules, chat sessions, analytics, and notifications.

```bash
npm run seed
```

This creates two demo accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@maand.tech` | `password123` |
| **User** | `user@maand.tech` | `password123` |

---

## 👥 User Roles & Access Control

Maand implements **Role-Based Access Control (RBAC)** enforced at the middleware level:

| Role | Access |
|---|---|
| **Guest** | `/`, `/about`, `/pricing`, `/modules`, `/contact`, `/login`, `/signup` |
| **User** | `/dashboard/**` — all patient-facing features |
| **Admin** | `/admin/**` + all above — full platform management |

- Unauthenticated users are redirected to `/login`
- Role violations redirect to `/dashboard` (or a 403 for API routes)
- **2FA** is enforced at middleware level: if a session requires 2FA, users are gated to `/auth/2fa` until verified

---

## 🧩 Core Functionalities

### 1. AI Chat (RAG + AI)

**Route:** `POST /api/chat`

The AI chat system is a multi-stage pipeline:

1. **Rate Limiting** — 15 requests/minute per user
2. **Crisis Detection** — keyword scanning; if detected, returns an emergency helpline message and logs an audit event instead of calling AI
3. **Emotion Detection** — the user's message is classified using HuggingFace's `roberta-base-go_emotions` model (28 emotion classes)
4. **RAG Retrieval** — the message is embedded using `sentence-transformers/all-MiniLM-L6-v2` and compared (cosine similarity) against a local therapy knowledge base. Relevant chunks (similarity >= 0.3) are injected into the system prompt
5. **AI Response** — a generative AI model produces an empathetic, clinically-aware response, with automatic fallback if the primary model fails
6. **Message Persistence** — both the user message (with emotion tag) and the AI response are saved to MongoDB
7. **Session Tracking** — session duration is updated on every exchange

**RAG Knowledge Base** is stored at `services/rag/knowledge-base.json`. Embeddings are disk-cached at `services/rag/embeddings-cache.json` to avoid recomputation on every request.

**Chat UI features:**
- Real-time streaming-style display
- Session management (start new / continue existing)
- Crisis alert banner
- Persona customization (adjusts AI tone)
- Module context (AI tailors guidance to the active module)

---

### 2. Emotion Detection

Every user message sent to the AI chat is automatically analyzed using HuggingFace's `SamLowe/roberta-base-go_emotions` model. The detected emotion (e.g., `joy`, `sadness`, `anger`, `fear`, `neutral`) is:

- Stored with the message in the database
- Passed to the AI as context so it can tailor its response to the user's emotional state
- Used to generate mood trend charts in the dashboard

---

### 3. Therapy Modules

**Route:** `/dashboard/modules`

Structured evidence-based therapy programs inspired by CBT, DBT, and mindfulness approaches. Each module includes:

- Title, description, category, and difficulty level
- Sequential lessons with content and completion tracking
- Progress tracking per user (`UserModuleProgress` model)
- Estimated duration and prerequisite modules
- Public module catalogue visible without login at `/modules`

Users can enroll, track lesson-by-lesson progress, and see completion percentages on the dashboard.

---

### 4. Avatar Customization

**Route:** `/dashboard/avatar`

Users can build and customize a personal therapy companion avatar. The avatar builder includes:

- Selection of avatar style, skin tone, hair, accessories
- Real-time preview
- **Facial Expression Recognition** using MediaPipe — the camera detects the user's facial landmarks and maps them to avatar expressions in real time
- **Gesture Recognition** using MediaPipe — hand gestures (e.g., thumbs up, open palm) are recognized and trigger avatar reactions
- Avatar persona description (used to personalize the AI chat system prompt)

---

### 5. Immersive Grounding Exercises

**Route:** `/dashboard/immersive`

A set of guided, interactive mental wellness exercises:

| Exercise | Description |
|---|---|
| **Breathing Exercise** | Animated inhale/hold/exhale cycle with visual cues |
| **5-4-3-2-1 Grounding** | Sensory grounding technique to reduce anxiety |
| **Emergency Calm** | Rapid de-escalation sequence for panic moments |
| **Grounding Modal** | Inline modal version triggerable from dashboard |

---

### 6. Video Therapy Sessions

**Route:** `/dashboard/therapy/video`

Live video sessions powered by **Daily.co**:

- Create, schedule, and join video rooms
- Session duration tracking
- Session history and recordings linked to therapy progress

---

### 7. Mood Check-in & Goals

**Mood Check-in** (dashboard mood widget):
- Daily mood rating (1–10 scale)
- Trend chart showing mood over time (powered by Recharts)
- Mood data feeds into session analytics

**Goal Setting** (dashboard goals widget):
- Create personal mental health goals
- Mark goals as complete
- Goals are persisted in MongoDB (`Goal` model)

---

### 8. Reports & Analytics

**Route:** `/dashboard/reports`

Users can generate and download their mental health outcome reports:

- **PHQ-9** (Depression), **GAD-7** (Anxiety), **PCL-5** (PTSD) score summaries
- Trend data and session history summaries
- Exportable as **PDF** (via jsPDF / @react-pdf/renderer)
- Admin analytics dashboard with platform-wide stats (total users, sessions, module completions)

---

### 9. Notifications

**Route:** `/dashboard/notifications`

- In-app notification center
- Notifications for session reminders, module completions, and system alerts
- Mark as read / dismiss
- Real-time badge count in the nav

---

### 10. Admin Panel

**Route:** `/admin` *(admin role only)*

| Section | Functionality |
|---|---|
| **Overview** | Platform KPIs (total users, active sessions, module stats) |
| **User Management** | View, filter, activate/deactivate user accounts |
| **Analytics** | Platform usage trends, session analytics |
| **Settings** | System-wide configuration |

---

### 11. Authentication & Security

**Authentication flows:**
- Email/password sign-up with email verification
- Google OAuth sign-in
- Forgot password / reset password via email (Resend)
- **Two-Factor Authentication (2FA)** — TOTP-based (otplib + QR code via `qrcode`), enforced at middleware level

**Security features:**
- Passwords hashed with bcryptjs
- NEXTAUTH_SECRET for JWT signing
- Custom ENCRYPTION_KEY for sensitive data encryption
- **Audit Logging** — all sensitive actions (login, crisis escalation, admin actions) are logged to the `AuditLog` collection
- Route-level RBAC via Next.js middleware
- API rate limiting on the chat endpoint (15 req/min)
- Zod schema validation on all API inputs

---

### 12. Legacy Profile

**Route:** `/dashboard` (legacy section)

A digital well-being journal / legacy profile where users can write personal reflections, record their mental health journey milestones, and create a private narrative of their progress. Data stored in the `LegacyProfile` model.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out | No |
| `POST` | `/api/chat` | AI therapy chat | User |
| `GET` | `/api/dashboard` | Dashboard summary data | User |
| `GET/POST` | `/api/goals` | Get / create goals | User |
| `GET` | `/api/modules` | List therapy modules | Public |
| `GET/POST` | `/api/notifications` | Notifications | User |
| `GET/POST` | `/api/reports` | Mental health reports | User |
| `GET/POST` | `/api/therapy` | Therapy session management | User |
| `GET/PUT` | `/api/user` | User profile | User |
| `GET/POST` | `/api/video-sessions` | Video session management | User |
| `GET` | `/api/users` | List all users | Admin |
| `GET/POST` | `/api/admin/**` | Admin management APIs | Admin |
| `GET` | `/api/health` | Health check | No |

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` to your Vercel project settings
4. Deploy — Vercel auto-detects Next.js and configures the build

> **Note for pnpm users on Vercel:** Add `ENABLE_EXPERIMENTAL_COREPACK=1` to your Vercel environment variables to enable pnpm 9+.

### Build for Production Locally

```bash
npm run build
npm run start
```

---

## 🏗️ Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the MongoDB database with demo data |

---

## 🤝 Support & Contact

- **Email:** support@maand.tech
- **Clinical Partnerships:** support@maand.tech (priority response)

---

## ⚠️ Disclaimer

Maand is an academic Final Year Project (FYP) and is **not a substitute for professional mental health care**. If you are in crisis, please contact emergency services or a licensed mental health professional immediately.

**Crisis Resources:**
- 🇺🇸 National Suicide Prevention Lifeline: **988**
- 🌍 International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
