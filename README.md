# Xeno Copilot — AI-Native Mini CRM

> A production-grade, AI-native CRM that helps consumer brands intelligently reach their shoppers — segment audiences with natural language, draft personalized campaigns with AI, and track message delivery in real time through a full callback-driven channel service.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | [Railway](https://ai-native-mini-crm-production-717d.up.railway.app) |
| Backend | [Railway](https://ai-native-mini-crm-production.up.railway.app) |
| Channel Service | [Render](https://ai-native-mini-crm-channel-service.onrender.com) |

---

## What It Does

A marketer using this product can:

- **Ingest** customer and order data via CSV or JSON upload
- **Segment** audiences using natural language — *"VIP customers in Mumbai who spent over ₹50,000"* → AI converts to filters → live customer count
- **Draft** personalized WhatsApp / SMS / Email / RCS messages using AI
- **Launch** campaigns to a segment and watch delivery stats update live
- **Track** the full communication lifecycle: `sent → delivered → read → clicked → failed`
- **Understand** campaign performance through AI-generated plain-English summaries
- **Ask** the AI Copilot anything — *"Which segment has the best ROI this month?"*

---

## Architecture

```
┌─────────────────────────────┐
│     React Frontend          │
│   (TanStack Start + Router) │
└────────────┬────────────────┘
             │ REST API calls
┌────────────▼────────────────┐
│     CRM Backend             │
│     (Node.js + Express)     │
│                             │
│  /customers/import          │
│  /campaigns/:id/launch  ────┼──► POST /send
│  /receipt  ◄────────────────┼──── async callback
│  /ai/segment                │
│  /ai/generate-message       │
│  /ai/campaign-insight       │
│  /ai/copilot                │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐     ┌──────────────────────────┐
│     Supabase (PostgreSQL)   │     │   Channel Service         │
│                             │     │   (Node.js + Express)     │
│  customers                  │     │                           │
│  campaigns                  │     │  Simulates async delivery │
│  communications             │     │  Waits 2–10s randomly     │
│  orders                     │     │  Calls back /receipt with │
└─────────────────────────────┘     │  delivered/read/clicked/  │
                                    │  failed outcome           │
                                    └──────────────────────────┘
```

The two-service callback loop mirrors how real messaging channels work — the CRM fires messages and the channel service asynchronously reports outcomes back.

---

## AI Features

| Feature | How it works |
|---|---|
| **Natural Language Segmentation** | Marketer types a query → Groq converts to JSON filters → Supabase runs query → live customer count |
| **AI Message Writer** | Pick segment + channel → Groq drafts a personalized message → marketer edits and sends |
| **Campaign Insight** | After campaign runs → Groq reads delivery/click stats → writes plain English summary with recommendation |
| **AI Copilot** | Chat interface on dashboard → answers questions about customers, segments, campaigns using real DB data |

All AI calls go through the backend — the Groq API key is never exposed to the browser.

---

## Tech Stack

### Frontend
- **React** via TanStack Start
- **TanStack Router** — file-based routing
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Lucide React** — icons
- **Sonner** — toast notifications
- **Bun** — package manager + runtime
- **Vite** — build tool

### Backend
- **Node.js** + **Express.js**
- **TypeScript** via ts-node
- **Multer** — file upload (CSV/JSON ingestion)
- **csv-parse** — CSV parsing
- **dotenv** — environment config
- **nodemon** — dev auto-restart

### Database
- **Supabase** (PostgreSQL)
- Tables: `customers`, `campaigns`, `communications`, `orders`

### AI
- **Groq API** — LLM inference
- Model: `llama-3.3-70b-versatile`

### Deployment
- **Railway** — frontend + backend
- **Render** — channel service
- **Supabase** — database (managed)

---

## Project Structure

```
MiniCRM/
├── Xeno_Copilot_frontend/        # React frontend (Bun + TanStack)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.tsx         # Dashboard + AI Copilot widget
│   │   │   ├── customers.tsx     # Customer Explorer + AI Segment Builder
│   │   │   ├── campaigns.tsx     # Campaign management + live stats
│   │   │   ├── analytics.tsx     # Analytics charts
│   │   │   └── copilot.tsx       # Full AI Copilot chat
│   │   ├── components/
│   │   │   ├── common/           # ChannelBadge, SegmentPill, StatusPill
│   │   │   ├── kpi/              # KPI cards
│   │   │   └── copilot/          # AI Copilot widget
│   │   └── data/
│   │       └── mockData.ts       # Fallback mock data
│   └── package.json
│
├── backend/                      # CRM API server
│   ├── src/
│   │   ├── index.ts              # All Express routes
│   │   └── seed.ts               # Seed customers, campaigns, orders
│   ├── .env
│   └── package.json
│
└── channel-service/              # Stubbed messaging service
    ├── index.ts                  # /send → async callback → /receipt
    └── package.json
```

---

## Key Design Decisions & Tradeoffs

**Why Groq over OpenAI?**
Groq's inference speed is significantly faster — critical for a real-time copilot experience where latency kills UX.

**Why Supabase over raw PostgreSQL?**
Managed hosting, instant REST API, and real-time capabilities out of the box. For this scope it's the right tradeoff — at scale I'd run a dedicated Postgres instance with connection pooling via PgBouncer.

**Why a separate Channel Service?**
The assignment explicitly models how real messaging infrastructure works — fire-and-forget with async callbacks. Keeping it separate makes the boundary clean and lets each service scale independently.

**What I'd do at scale:**
- Replace setTimeout simulation with a proper message queue (BullMQ / SQS)
- Add retry logic with exponential backoff for failed deliveries
- Use Supabase Realtime instead of polling every 3 seconds
- Add rate limiting and job batching for large campaigns (100k+ customers)
- Move AI inference to a queue to handle concurrent campaign launches

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- Bun ([install here](https://bun.sh))
- Supabase account
- Groq API key

### Install Bun (Windows)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/xeno-crm.git
cd xeno-crm
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
CHANNEL_SERVICE_URL=http://localhost:3001
CRM_URL=http://localhost:3000
PORT=3000
```

Run Supabase SQL to create tables:
```sql
create table customers (id text primary key, name text, email text, phone text, city text, total_orders integer default 0, total_spend numeric default 0, last_order_date date, segment text, preferred_channel text, join_date date, rfm_r integer, rfm_f integer, rfm_m integer);
create table campaigns (id text primary key default gen_random_uuid()::text, name text, message text, channel text, segment_filter text, status text default 'draft', sent integer default 0, delivered integer default 0, opened integer default 0, clicked integer default 0, created_at timestamptz default now());
create table communications (id text primary key default gen_random_uuid()::text, campaign_id text references campaigns(id), customer_id text references customers(id), status text default 'sent', channel text, message text, created_at timestamptz default now(), updated_at timestamptz default now());
create table orders (id text primary key default gen_random_uuid()::text, customer_id text references customers(id), amount numeric, items text, status text default 'completed', order_date date, created_at timestamptz default now());

alter table customers disable row level security;
alter table campaigns disable row level security;
alter table communications disable row level security;
alter table orders disable row level security;
```

Seed and start:
```bash
npx ts-node src/seed.ts
npm run dev
```

Backend runs on **http://localhost:3000**

### 3. Channel Service setup
```bash
cd channel-service
npm install
npm run dev
```

Channel service runs on **http://localhost:3001**

### 4. Frontend setup
```bash
cd Xeno_Copilot_frontend
bun install
```

Create `.env`:
```
VITE_API_URL=http://localhost:3000
```

```bash
bun run dev
```

Frontend runs on **http://localhost:8080**

### Run all 3 together
Open 3 separate terminals:

| Terminal | Command |
|---|---|
| Terminal 1 | `cd backend && npm run dev` |
| Terminal 2 | `cd channel-service && npm run dev` |
| Terminal 3 | `cd Xeno_Copilot_frontend && bun run dev` |

---

## Deployment Environment Variables

### Frontend (Railway)
```
VITE_API_URL=https://your-backend.up.railway.app
NITRO_PRESET=node-server
```

### Backend (Railway)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
CHANNEL_SERVICE_URL=https://your-channel-service.onrender.com
CRM_URL=https://your-backend.up.railway.app
PORT=3000
```

### Railway Build Settings (Frontend)
```
Build Command: bun install && bun run build
Start Command: bun run preview
```

---

## Data Ingestion

**Import customers** via CSV:
```
name,email,phone,city,total_orders,total_spend,segment,preferred_channel,join_date
Rahul Sharma,rahul@gmail.com,9876543210,Delhi,5,15000,loyal,whatsapp,2024-01-15
```

**Import orders** via CSV:
```
customer_id,amount,items,status,order_date
c1,3500,Silk Saree,completed,2025-06-10
```

Both CSV and JSON formats supported. Upsert on `id` prevents duplicates.

---

## Built With AI

This project was built AI-natively using Claude (Anthropic) throughout:
- Architecture decisions and tradeoff reasoning
- Boilerplate generation (Express routes, React components)
- Debugging (TypeScript errors, Supabase RLS issues, dotenv config)
- Seed data generation
- UI component structure

Every line of code has been reviewed, understood, and defended — ready to discuss any part of the implementation in the interview.

---
