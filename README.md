# Hanexis Lead — AI-Driven Social Media Lead Generation

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes (no separate server needed)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o-mini
- **Deploy**: Vercel

---

## Setup Guide

### 1. Clone the repo
```bash
git clone https://github.com/priyadarshini090805-del/hanexis_lead
cd hanexis_lead
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase/schema.sql`
3. Go to Settings → API and copy your keys

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=any-random-32-char-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy!

> For `NEXT_PUBLIC_APP_URL` on Vercel, use your actual domain like `https://hanexis-lead.vercel.app`

---

## Features

### Task 1 — Auth & User Management ✅
- Email/password signup & login
- JWT-based sessions via Supabase Auth
- Auto profile creation on signup
- Protected routes via middleware
- Role-based access (RLS in Supabase)

### Task 2 — Lead Management ✅
- Add, edit, delete leads
- Status tracking: New → Contacted → Converted → Lost
- Source tracking: LinkedIn, Instagram, Manual, Import
- Search + filter by status
- Dashboard with stats + conversion rate

### AI Personalization Engine ✅
- Generate 3 message types: Connection, Follow-up, Sales Pitch
- Powered by OpenAI GPT-4o-mini
- Context-aware: uses lead name, company, position, platform
- Message history saved to database
- One-click copy to clipboard

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/generate/     # AI message generation endpoint
│   │   └── auth/callback/   # OAuth callback
│   ├── dashboard/           # Main dashboard
│   ├── leads/               # Lead management
│   ├── ai-messages/         # AI message generator
│   ├── login/               # Auth pages
│   └── register/
├── components/
│   ├── layout/Sidebar.tsx
│   └── leads/LeadModal.tsx
├── lib/
│   ├── supabase.ts          # DB clients
│   ├── openai.ts            # AI service
│   └── utils.ts
├── types/                   # TypeScript types
└── middleware.ts            # Route protection
```
