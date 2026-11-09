# 🚀 OrbitReturn — Returns That Never Go Home
> **PS-16: Intelligent E-Commerce Return Management System**  
> *Hackstellar 2026 · Autonomous 3-Agent AI Pipeline that intercepts returns mid-transit to eliminate unnecessary warehouse journeys.*

---

## 🏆 What Makes OrbitReturn Special

Standard e-commerce logistics routes **100% of returned items back to central warehouses** — even when a buyer 2 km away wants that exact same SKU. This creates:
- 💸 ₹40–₹250+ redundant freight cost per return trip
- ⏳ 3–7 day warehouse turnaround delay
- 🌱 ~0.21 kg CO₂ per unnecessary km

**OrbitReturn deploys 3 autonomous AI agents** that work in parallel the moment a return is initiated, making decisions in < 2 seconds:

| Agent | Role |
|---|---|
| 🔵 **VisionQualityAgent** | Grades item condition (PRISTINE → DEFECTIVE) using 11 visual & packaging signals |
| 🔴 **FraudSentinelAgent** | Scores fraud risk (0–100) across 11 behavioral signals — velocity, clustering, account age |
| 🟢 **LogisticsDispatcherAgent** | Computes optimal routing using MongoDB 2dsphere geospatial index + weighted scoring formula |

---

## 🧠 Autonomous Decision Engine

$$S = w_1 C_{\text{condition}} + w_2 D_{\text{demand}} + w_3(1-F_{\text{fraud}}) + w_4 P_{\text{proximity}} + w_5 T_{\text{savings}}$$

| Factor | Weight | Signal |
|---|---|---|
| **Condition Score** | 25% | Packaging integrity, seal status, cosmetic wear, defects |
| **Demand Density** | 30% | Active pending orders for same SKU within 25 km radius |
| **Fraud Inverse** | 20% | Lower fraud risk → higher routing score |
| **Proximity** | 15% | Haversine distance to nearest matched order / hub |
| **Time Savings** | 10% | Hours saved vs central warehouse roundtrip |

### 3 Optimal Destinations
- ✨ **Direct to Peer** — Pristine items routed to a matching pending order nearby (fulfills order simultaneously!)
- 📦 **Regional Hub** — High-demand items staged in local micro-fulfillment hubs
- 🏭 **Central Warehouse** — Only defective / high-fraud items (last resort)

---

## 🤖 AI Features

### Agent Lab (Live Demo)
4 preset scenarios runnable in 1 click — watch the full 3-agent pipeline execute with real-time Chain of Thought reveal:
- ✨ **Pristine Return** → PRISTINE 97/100 → Direct Peer Intercept
- 🚨 **Fraud Ring** → HIGH RISK 88/100 → Quarantine + Warehouse
- 📦 **Damaged Transit** → DEFECTIVE 28/100 → RMA Warehouse
- 👗 **Size Mismatch** → LIKE_NEW 78/100 → Hub Staged

### AI Copilot
After every inspection, ask the AI anything: *"Why was it routed here?"*, *"Is it safe for resale?"*, *"Explain the fraud risk"*

### Batch AI Processing
One-click button on Returns Fleet page runs the full 3-agent pipeline on all unrouted returns simultaneously with live progress bar.

### Chain of Thought Transparency
Every agent decision is logged with full reasoning — `MultiAgentOrchestrator → VisionQualityAgent → FraudSentinelAgent → LogisticsDispatcherAgent` — visible to judges step by step.

---

## 🛡️ 11-Signal Fraud Radar

FraudSentinel scores every return across:
1. Return velocity (> 3 returns / 30 days)
2. High-value electronics pattern
3. Account age < 30 days + immediate return
4. Reason inconsistency vs. product category
5. Rapid return under 24h of delivery
6. Address cluster anomalies (same pincode)
7. Price tier risk (> ₹10,000 threshold)
8. Keyword analysis in return reason
9. Order frequency mismatch
10. Category fraud rate baseline
11. Cross-agent discrepancy (vision vs. claimed reason)

---

## 📊 Pages & Features

| Page | Route | What it Shows |
|---|---|---|
| **Dashboard** | `/` | Live KPIs, auto-refresh 30s, animated agent activity feed |
| **Agent Lab** | `/agent-lab` | 1-click demos, 3-agent pipeline, CoT reveal, AI Copilot chat |
| **Live Map** | `/map` | Leaflet geospatial radar with hub markers & return routes |
| **Returns Fleet** | `/returns` | All returns with search/filter, batch AI, stats bar |
| **New Return** | `/returns/new` | Automated — select order + reason → agents fire instantly |
| **Return Detail** | `/returns/[id]` | Re-analyze button, inline Copilot, full routing dossier |
| **Fraud Radar** | `/fraud` | Per-alert AI deep scan, approve/quarantine actions |
| **Driver App** | `/carrier` | Mobile sim with countdown scan animation + reroute alert |
| **Impact Report** | `/impact` | Live KPIs, routing donut chart, tech stack, demo CTA |

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) · TypeScript · Tailwind CSS · Lucide Icons |
| **Charts & Maps** | Recharts · Leaflet · react-leaflet |
| **Backend** | Node.js · Express · TypeScript · Multer |
| **Database** | MongoDB Atlas · Mongoose · 2dsphere Geospatial Indexing |
| **AI Engine** | 3 Autonomous Heuristic Agents + `@google/generative-ai` (Gemini fallback) |

---

## ⚡ Quickstart (60 seconds)

### Prerequisites
- Node.js 18+, npm

### Run Everything (One Command)
```bash
# From root Hackstellar/ directory
npm run dev
```
- **Backend** → `http://localhost:5000` (Express + MongoDB Atlas)
- **Frontend** → `http://localhost:3000` (Next.js)

> **Note:** On Windows with Turbopack issues, the frontend uses `--webpack` flag automatically.

### Re-seed Demo Data
```bash
npm run seed
```
Seeds: 15 products · 8 hubs · 40 users · 80 orders · 21 returns across Indian metros.

---

## 🎯 Judge Demo Script (5 minutes)

### 1. Dashboard (`/`) — 30 sec
- Point to live KPI numbers: Total Cost Saved, CO₂ Offset, Avg Return Score
- Note the **auto-cycling Live Agent Activity feed** (refreshes every 8s with new events)

### 2. Agent Lab (`/agent-lab`) — 2 min ⭐ KEY DEMO
- Click **✨ Pristine Return** → watch 3 agents fire in parallel → Chain of Thought reveals step by step
- Click **🚨 Fraud Ring** → show how FraudSentinel catches it at HIGH RISK
- Click **📦 Damaged Transit** → DEFECTIVE → Warehouse routing
- Use **AI Copilot** → ask *"Why was it routed here?"* → intelligent response

### 3. Driver App (`/carrier`) — 1 min
- Select a package → Click "Scan Package Barcode" → **3-2-1 countdown** → agent pipeline → "DO NOT RETURN TO WAREHOUSE!" banner

### 4. Live Map (`/map`) — 30 sec
- Show geospatial dots across Mumbai, Delhi, Bengaluru, Chennai
- Point to 5-stat bar: Intercept Rate, CO₂ Avoided

### 5. Impact Report (`/impact`) — 30 sec
- Scroll through the full impact summary with routing donut chart
- Hits all judge evaluation criteria in one page

---

## 📁 Project Structure

```
Hackstellar/
├── client/                    # Next.js 16 frontend
│   └── src/
│       ├── app/               # Pages (dashboard, agent-lab, map, returns, fraud, carrier, impact)
│       ├── components/        # Navbar, KPICards, ReturnCard, MapComponent, etc.
│       ├── lib/               # api.ts, utils.ts
│       └── types/             # Shared TypeScript types
└── server/                    # Express backend
    └── src/
        ├── agents/            # visionQualityAgent, fraudSentinelAgent, logisticsDispatcherAgent, agentOrchestrator
        ├── controllers/       # dashboard, returns, routing, orders, agents
        ├── models/            # Return, Product, Hub, User, Order, FraudLog
        ├── routes/            # All REST API routes
        └── services/          # demandMatcher, seed
```

---

*Built for **Hackstellar 2026** · PS-16 · Returns That Never Go Home*
