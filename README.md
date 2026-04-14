# GPU ROI Calculator Suite

Embeddable GPU profitability widgets for Wix iframes. Real-time mining, cloud leasing, and AI inference data. No backend.

## Live Demo

Full Calculator: [pushstartsims.com/power](https://www.pushstartsims.com/power)
PC Product Showcase (with ticker): [pushstartsims.com/tech](https://www.pushstartsims.com/tech)

## Architecture

### GPU ROI Engine v3.0 (`GPU_ROI_Engine.js`)

Core profitability calculation engine used by all widgets.

**GPU Database**: 52+ devices covering consumer GPUs (RTX 50/40/30, AMD RX 7000/6000, Intel Arc), datacenter accelerators (B200, H200, H100, A100), ASICs (Antminer S21/S19), and CPUs (EPYC, Threadripper, Ryzen, Core Ultra).

**Live Data Integration**: Multi-source with fallback validation. Crypto prices from CoinGecko + CryptoCompare. Mining profitability from WhatToMine via CORS proxy. Network fees from mempool.space + blockchair. Cloud lease rates from Vast.ai public API.

**Data Validation**: Outlier rejection enforces 25% agreement threshold between sources. Outliers excluded, median computed. CORS-safe via public endpoints and corsproxy.io. Cache tiers: in-memory (55s TTL) + localStorage (550s TTL) + last-live persistence (unlimited). Auto-refresh every 60 seconds. Three-tier fallback strategy: live API > persisted last-live data > hardcoded baselines. Stale data warnings show age when current sources fail. Settings persist in localStorage.

**Configuration**: Electricity $0.02-$0.35/kWh. Pool fee 0.5-3%. Cloud platform fee 0-20%. AI platform fee fixed at 10% (not user-configurable). BTC tx fee ~$0.50. Primary mining algo: Ergo (Autolykos). Baseline assumes Austin, TX (electricity $0.12/kWh, cloud fee 10%, pool fee 1.5%).

**Profit Calculation**: For each GPU, computes net daily profit across three income streams:
- Mining: Gross hashrate-based revenue minus pool fee, electricity, and network fee.
- Cloud Lease: Hourly rate (live from Vast.ai or fallback) * 24 hours, minus cloud platform fee and electricity.
- AI Inference: Hourly rate * 24 hours, minus AI platform fee (10%) and electricity.

Returns best stream by profit, ROI in days (price / daily profit), and efficiency ratio (profit per watt).

### API Modules

**CoinGecko + CryptoCompare**: Crypto prices for BTC, ETH, KAS, RVN, ERGO, ETC. Validates price agreement within 25% range.

**WhatToMine**: Real-time network difficulty and coin data for mining algorithms (SHA256, Kheavyhash, Autolykos, Etchash, Kawpow).

**mempool.space + blockchair**: Bitcoin network fee estimation via fast/standard/slow tx tiers. Uses fast tier for calculations.

**Vast.ai**: Cloud GPU lease rates by model name. Returns min/median/max/count for eech GPU type. Falls back to hardcoded rates if Vast API unavailable.

**SerpAPI** (optional): Retail GPU pricing via Google Shopping (disabled by default, requires API key).

## Widgets

### `GPU_ROI_Full.html` (2,789 lines)

Complete dashboard with searchable GPU table, profit breakdowns, and settings panel.

- Sortable columns: profit, ROI, efficiency, TDP, price.
- Brand filters (NVIDIA, AMD, Intel, Bitmain, Others).
- Category filters (consumer, datacenter, ASIC, CPU).
- Search by GPU name.
- Configurable settings: electricity cost, pool fee, cloud platform fee, API key for SerpAPI.
- Status indicator showing live/stale/offline states.
- Responsive table with pagination.
- Dark theme (#090a0f accent #f97316).

### `GPU_ROI_Ticker.html` (2,478 lines)

Scrolling ticker that expands to GPU card grid.

- Compact marquee showing top profitable GPUs.
- Expandable detail view with sortable grid.
- Brand filters and sort controls.
- Electricity cost slider.
- 60-second refresh timer.
- Tooltip breakdown: mining, cloud, AI profit by stream.
- Wix iframe optimized.

### `GPU_ROI_Ribbon.html` (2,353 lines)

Horizontal ribbon display for sidebars or header areas.

- Fixed-height ribbon (180px) with GPU card rows.
- Sorted by daily profit.
- Brand-colored badges.
- Status indicator and refresh timer.
- Hover tooltips with profit breakdown.
- Minimal controls (settings panel).

### `GPU_ROI_Ribbon_Ticker.html` (2,031 lines)

Minimal scrolling ticker with infinite scroll marquee.

- Lightest widget: single horizontal marquee of GPUs.
- No expand/collapse - ticker only.
- Header with Pushstart branding, LIVE status, 60s timer.
- Brand badges and profit display.
- Ideal for header bar embeds.
- Responsive 320px to 5K+.

## Files

| File | Lines | Description |
|------|-------|-------------|
| `GPU_ROI_Engine.js` | 1,248 | Shared v3.0 engine module (standalone reference) |
| `GPU_ROI_Full.html` | 2,789 | Full dashboard widget (engine inlined) |
| `GPU_ROI_Ticker.html` | 2,478 | Ticker + expandable grid (engine inlined) |
| `GPU_ROI_Ribbon.html` | 2,353 | Ribbon widget for sidebars (engine inlined) |
| `GPU_ROI_Ribbon_Ticker.html` | 2,031 | Minimal scrolling ticker (engine inlined) |
| `INTEGRATION_SUMMARY.txt` | 284 | v3.0 integration log and verification checklist |
| `README.md` | this file | Documentaion |

## Engine API

**Initialization**:
```javascript
GPURoiEngine.Engine.init({
  electricityCost: 0.12,
  poolFeePercent: 1.5,
  cloudPlatformFeePercent: 10,
  onUpdate: (results, isLive) => {},
  onStaleWarning: (age) => {}
});
```

**Core Methods**:
- `Engine.refresh()` - Fetch live data and calculate all GPUs (async).
- `Engine.calculateAll(sortBy)` - Calculate all 52 GPUs with current settings.
- `Engine.startAutoRefresh(ms)` - Begin periodic refresh loop (default 60s).
- `Engine.updateSetting(key, value)` - Change electricity cost / fees on-the-fly.
- `Engine.getDataSources()` - Check which APIs succeeded/failed.
- `Engine.getGPUDatabase()` - Access full GPU list.

**Properties**:
- `isLive` - Boolean: true if any live API source working.
- `isStale` - Boolean: true if all APIs failed.
- `lastRefresh` - Date timestamp of last data fetch.
- `electricityCost` - Current $/kWh setting.
- `poolFeePercent` - Current mining pool fee %.
- `cloudPlatformFeePercent` - Current cloud lease fee %.

**GPU Result Object**:
- `gpu`, `brand`, `category`, `tdp`, `msrp`, `vram`, `cudaCores`.
- `bestDailyProfit` - Max profit across mining/cloud/AI streams.
- `best` - Object with type, label, dailyProfit, etc.
- `streams` - Array of all three income streams with details.
- `roiDays` - Return on investment payback period.
- `efficiency` - Profit per watt ratio.
- `commentary` - Hardware description.

**Slider UI**:
```javascript
GPURoiEngine.SliderUI.create(container, {
  theme: 'dark',
  onUpdate: (key, value) => Engine.updateSetting(key, value)
});
```

**Stale Banner**:
```javascript
GPURoiEngine.StaleBanner.create(container, { theme: 'dark' });
```

## Tech Stack

HTML5 / CSS3 / Vanilla JS (ES6+). Zero dependencies. No frameworks or build tep. Google Fonts (IBM Plex Sans). Client-side only, no backend. CORS-safe via public endpoints and corsproxy.io dual-proxy chain.

## Browser Support

Chrome / Edge 90+, Firefox 88+, Safari 14+. Mobile responsive (320px+). Touch-friendly on tablets. Works in Wix iframe embeds.

## Known Limitations

- AI platform fee not user-configurable (fixed 10%).
- SerpAPI for retail GPU prices optional and requires key.
- GPU cloud rates depend on Vast.ai availability.
- Mining profitability limited to algorithms supported by WhatToMine.

## License

Proprietary. Pushstart LLC. All rights reserved.

## Author

Pawan K Jajoo, Pushstart LLC
