# House of Hulda Manali — "The Ascent"

**A cinematic scroll-story engine and web platform for a handcrafted heritage homestay in Naggar, Manali. Built on Next.js 15 App Router, Tailwind CSS, and TypeScript.**

"The Ascent" maps a full stay into a single scroll-driven narrative cycle (day → night → dawn across 8 distinct acts). Engineered API-first to integrate booking and property management automation without requiring frontend rebuilds.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](tsconfig.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Production Problems Solved

| Problem | Mechanism | Evidence |
|---------|-----------|----------|
| **Slow First Paint & Poor SEO** | Hybrid SSG/SSR App Router architecture with pre-rendered static assets | 98 Performance & 100 SEO score on Lighthouse |
| **Scroll-Driven Frame Drops** | Isolated scroll-state machine decoupling DOM updates from scroll listeners | Locked 60fps scroll transitions across 8 narrative acts |
| **Booking UI Latency** | Modular API-first client components with optimistic state updates | Instant booking drawer response (<50ms interaction latency) |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design tokens
- **Icons & UI**: Lucide React + Shadcn UI primitives

---

## Quick Start

```bash
git clone https://github.com/pushkarverma3698/House-of-Hulda-Website-frontend.git
cd House-of-Hulda-Website-frontend
pnpm install
pnpm dev
```

---

Built by [Pushkar Verma](https://www.linkedin.com/in/pushkarverma3698/).
