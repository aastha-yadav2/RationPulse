# RationPulse — Predict shortages. Prevent hunger.

RationPulse is an AI-powered decision-support prototype for India's Public Distribution System (PDS). It forecasts potential ration stock shortages at Fair Price Shops (FPS) and recommends safe stock redistribution from nearby surplus shops while protecting each donor's own projected demand and safety buffer.

> **Disclaimer:** All data and forecasts in this prototype are **DEMO DATA** running in **"Predictive simulation — demo mode"**. They do not represent actual government data or validated ML predictions.

## Features

- **Overview Dashboard**: KPI summary, Rice vs. Wheat stock distribution chart, risk distribution donut, weekly demand trend, and recent operational alerts.
- **Shortage Prediction**: Shop- and commodity-wise coverage days, predicted shortage dates, replenishment lead times, sorting, and filtering (`Low`, `Medium`, `High`, `Critical`).
- **Shop Inventory**: Interactive FPS directory with a slide-over detail drawer for commodity coverage and transfer readiness.
- **Smart Redistribution**: Safety-guarded redistribution engine (`Protected Stock = Demand × Lead Time + 2-Day Safety Buffer`), **Generate Recommendation** action, and **Approve / Reject** workflow that updates live shop inventories.
- **Alerts**: Filterable shortage risk, delivery delay, and stock imbalance notifications with acknowledgement workflow.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Recharts
- Lucide React

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
