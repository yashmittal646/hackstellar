# 🚀 OrbitReturn — Returns That Never Go Home
> **PS-16: Intelligent E-Commerce Return Management System**  
> *Autonomous multi-factor rerouting engine that intercepts returns mid-transit to prevent unnecessary warehouse journeys.*

---

## 🌟 The Core Innovation

In standard e-commerce logistics, **100% of returned items are shipped back to central regional warehouses**, even when a buyer just a few blocks away wants that exact same SKU. This leads to:
1. Massive redundant freight costs (₹40–₹250+ per trip).
2. Delayed turnaround times (3–7 days round-trip).
3. Heavy transport carbon emissions (~0.21 kg CO₂ per km).

**OrbitReturn intercepts returns mid-transit** and dynamically chooses between 3 optimal paths:
- 🚀 **Direct to Peer (Customer)**: Instantly re-routes pristine/good condition items to matching pending orders within 25 km and marks the pending order as `SHIPPED` via closed-loop fulfillment.
- 📦 **Regional Fulfillment Hub**: Stages high-demand items in local micro-hubs across major metros.
- 🏭 **Central Warehouse**: Only routes defective, damaged, or high-risk fraudulent returns for physical inspection.

---

## 🧠 Decision Engine Formula

$$\text{Routing Score } S = w_1 \cdot C_{\text{condition}} + w_2 \cdot D_{\text{demand}} + w_3 \cdot (1 - F_{\text{fraud}}) + w_4 \cdot P_{\text{proximity}} + w_5 \cdot T_{\text{time\_savings}}$$

| Factor | Weight | Description |
|---|---|---|
| **$C_{\text{condition}}$** | **25%** | Graded via return reason & visual inspection telemetry (Packaging integrity, seal authenticity, cosmetic wear) |
| **$D_{\text{demand}}$** | **30%** | Density of active pending orders for that SKU in nearby radius |
| **$F_{\text{fraud}}$** | **20%** | Inverted fraud risk score calculated across 6 behavioral signals |
| **$P_{\text{proximity}}$** | **15%** | Proximity to the nearest matched delivery address |
| **$T_{\text{time\_savings}}$** | **10%** | Transit hours saved vs sending to Central Mega-Depot (Delhi NCR) |

---

## 🛡️ Multi-Signal Fraud Radar & Admin Override

Every return is scored from 0–100 before routing:
1. **Return Velocity Check**: Users with >3 returns in 30 days trigger risk flags.
2. **High-Value Pattern**: Repeated returns on electronics / luxury items (>₹5,000).
3. **Account Age Velocity**: New accounts (<30 days) with immediate return requests.
4. **Reason Inconsistency**: Damage reported without proof / contradictory reasoning.
5. **Rapid Return Velocity**: Items returned under 24 hours from initial delivery.
6. **Address Cluster Anomalies**: Spatial clustering of returns within the same pincode.

> **Admin Override**: Operations staff can review quarantined returns in the Fraud Radar, inspect telemetry, and either confirm quarantine or clear false positives for instant local rerouting.

---

## 💻 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Leaflet GIS
- **Backend**: Node.js, Express, TypeScript, Multer, Mongoose ODM
- **Database**: MongoDB Atlas with 2dsphere Geospatial Indexing
- **Algorithms**: Haversine Spherical Distance, Weighted Multi-Factor Decision Engine, Multi-Signal Fraud Scoring

---

## ⚡ Quickstart Guide

### 1. Configure MongoDB Atlas
Already configured in `server/.env` with your active Atlas database.

### 2. Run Both Frontend & Backend (One Command)
In the root directory:
```bash
npm run dev
```
- Backend runs on `http://localhost:5000`
- Web Dashboard opens on `http://localhost:3000`

*(Or run separately with `npm run dev:server` and `npm run dev:client`)*

### 3. Re-seed Demo Data (Anytime)
```bash
npm run seed
```

---

## 🎯 Hackathon Presentation Flow

1. **Dashboard Overview (`/`)**: Show live metrics: ₹ Total Cost Saved, kg CO₂ Carbon Offset, and Turnaround Acceleration.
2. **Dynamic Allocation Chart**: Highlight how only a small fraction reaches the central warehouse.
3. **Live Geospatial Radar (`/map`)**: View live returns across Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, and Pune rerouting in real-time.
4. **Interactive Return Simulation (`/returns/new`)**:
   - Pick a test order (e.g. iPhone or Nike Jordan).
   - Select reason *"Changed my mind"* → watch the engine match a pending order 12km away and mark it as fulfilled!
   - Select reason *"Damaged screen"* → watch the engine quarantine it to the Central Warehouse.
5. **Explainable AI Breakdown (`/returns/[id]`)**: Show judges the exact weighted factor scores.
6. **Fraud Radar (`/fraud`)**: Demonstrate how suspicious return velocity is blocked and how admins can override false positives.
