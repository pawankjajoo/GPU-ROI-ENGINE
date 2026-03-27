# GPU ROI Calculator Suite

Embeddable GPU profitability widgets for Wix iframes. Real-time mining, cloud leasing, and AI inference data. No backend.

## Live Demo

Full Calculator: [pushstartsims.com/power](https://www.pushstartsims.com/power)
PC Product Showcase (with ticker): [pushstartsims.com/tech](https://www.pushstartsims.com/tech)

## Architecture

### GPU ROI Engine v3.0 (`GPU_ROI_Engine.js`)

Shared profitability engine used by all widgets.

52+ GPU database: consumer (RTX 50/40/30, AMD RX 7000/6000, Intel Arc), datacenter (B200, H200, H100, A100), ASICs (Antminer S21/S19), CPUs (EPYC, Threadripper, Ryzen, Core Ultra).

Multi-source live API integration with validation and fallback. Crypto prices from CoinGecko + CryptoCompare. Mining profitability from WhatToMine via CORS proxy. Network fees from mempool.space + blockchair. Cloud lease rates from Vast.ai public API.

Outlier rejection: sources must agree within 25%. Outliers excluded, median used. Configurable sliders for electricity ($0.02-$0.35/kWh), pool fee (0.5%-3%), cloud platform fee (0%-20%). CORS-safe via public endpoints or corsproxy.io. Works in any browser including Wix iframe embeds. Cache: in-memory (55s TTL) + localStorage (550s TTL) + last-live persistence (no TTL). Auto-refresh every 60s. Three-tier fallback: live API → last successful live data (persisted in localStorage) → hardcoded baseline estimates. Stale data banner shows the age of last-live data when current sources are unreachable. Hardcoded baselines used only when no prior live data exists. Settings persistence via localStorage.

### Defaults (Austin, TX baseline)

Electricity: $0.12/kWh. Cloud platform fee: 10% (Vast.ai removed hosting fee; RunPod ~10%). Mining pool fee: 1.5%. BTC tx fee: ~$0.50. Best GPU mining algo: Ergo (Autolykos), Mar 2026.

## Widgets

### `GPU_ROI_Full.html`

Full dashboard. Sortable/filterable GPU table, detailed breakdowns, search, brand/category filters, pagination.

### `GPU_ROI_Ticker.html`

Scrolling ticker bar that expands to a searchable GPU card grid. Brand filters, sort controls, 60s countdown timer.

### `GPU_ROI_Ribbon.html`

Horizontal ribbon with top GPUs, profit indicators, status badges. Compact format for sidebars.

### `GPU_ROI_Ribbon_Ticker.html`

Minimal scrolling ticker with GPU profit display. Lightest widget. Suited for header bars.

### `PC Page Redesign.html`

PC product showcase with GPU profitability ticker, product cards (GPU servers + VR gaming PCs), lightbox gallery, comparison charts (RTX 4090 vs 5090 vs H100), 16-GPU Fleet ROI table, H200 explainer.

## Files

| File | Description |
|------|-------------|
| `GPU_ROI_Engine.js` | Shared v3.0 engine module (standalone ref) |
| `GPU_ROI_Full.html` | Full dashboard widget (engine inlined) |
| `GPU_ROI_Ticker.html` | Ticker + grid widget (engine inlined) |
| `GPU_ROI_Ribbon.html` | Ribbon widget (engine inlined) |
| `GPU_ROI_Ribbon_Ticker.html` | Simplified ribbon ticker (engine inlined) |
| `INTEGRATION_SUMMARY.txt` | v3.0 integration log and verification |
| `README.md` | This file |

## Tech Stack

HTML5 / CSS3 / Vanilla JS (ES6+). Zero dependencies. No frameworks, no build step. Google Fonts (IBM Plex Sans / Inter). Client-side only. No backend. CORS-safe API fetching via corsproxy.io.

## Browser Support

Chrome / Edge 90+, Firefox 88+, Safari 14+, Mobile (responsive + touch).

## License

Proprietary. Pushstart LLC. All rights reserved.

## Author

Pushstart LLC, Pawan K Jajoo
