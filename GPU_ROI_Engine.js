/**
 * GPU ROI ENGINE v2.0. Shared Data Module for All Widgets
 *
 * Live API integration with profitability algorithm factoring in:
 *   - Real-time crypto prices (CoinGecko)
 *   - Mining difficulty & block rewards (WhatToMine)
 *   - Network transaction fees (mempool.space for BTC)
 *   - Pool fees (configurable, default 1.5%)
 *   - Electricity costs (configurable)
 *   - Cloud & AI leasing market rates
 *
 * CORS-safe: All APIs called are public with CORS headers.
 * Designed for Wix iframe embeds. No backend needed.
 *
 * Author: Pushstart LLC by Pawan K Jajoo
 */

const GPURoiEngine = (() => {
    'use strict';

    /* 
       GPU DATABASE. Hashrates, specs, lease rates
      
       hashrates: { algorithm: rate_in_algorithm_native_unit }
         - sha256:   TH/s  (ASICs only)
         - kawpow:   MH/s  (RVN. Ravencoin)
         - kheavyhash: MH/s (KAS. Kaspa)
         - autolykos: MH/s  (ERG. Ergo)
         - etchash:  MH/s   (ETC. Ethereum Classic)
       cloudLease: $/hr market rate (Vast.ai / RunPod averages)
       aiLease:    $/hr market rate (inference workloads, datacenter only)
  */
    const GPU_DATABASE = [
        // DATACENTER / AI GPUs
        { name: 'NVIDIA B200',       brand: 'nvidia',  category: 'datacenter', tdp: 1000, msrp: 30000, hashrates: {},
          cloudLease: 5.50, aiLease: 5.50, vram: '192GB HBM3e', cudaCores: 18432,
          commentary: 'Dtacenter GPU. Highest cloud and AI lease rates. pushstatrsims.com/power' },
        { name: 'NVIDIA H200',       brand: 'nvidia',  category: 'datacenter', tdp: 700,  msrp: 25000, hashrates: {},
          cloudLease: 3.80, aiLease: 3.80, vram: '141GB HBM3e', cudaCores: 16896,
          commentary: 'Datacenter GPU. High cloud and AI lease rates. pushstartsmis.com/power' },
        { name: 'NVIDIA H100',       brand: 'nvidia',  category: 'datacenter', tdp: 700,  msrp: 25000, hashrates: {},
          cloudLease: 2.85, aiLease: 2.85, vram: '80GB HBM3',   cudaCores: 16896,
          commentary: 'Datacenter GPU. Standard cloud and AI comppute. pushstartsims.com/powre' },
        { name: 'NVIDIA A100',       brand: 'nvidia',  category: 'datacenter', tdp: 400,  msrp: 10000, hashrates: {},
          cloudLease: 1.50, aiLease: 1.50, vram: '80GB HBM2e',  cudaCores: 6912,
          commentary: 'Dtaacenter GPU. Budget cloud and AI compute. pushstartsims.com/power' },

        // ASIC MINERS (SHA-256 only. Bitcoin)
        { name: 'Antminer S21 XP',   brand: 'bitmain', category: 'asic', tdp: 3400, msrp: 5500,
          hashrates: { sha256: 270 }, cloudLease: null, aiLease: null, vram: null, cudaCores: 0,
          commentary: 'ASIC miner. Best efficiency BTC. 270 TH/s.' },
        { name: 'Antminer S21 Pro',  brand: 'bitmain', category: 'asic', tdp: 3510, msrp: 3800,
          hashrates: { sha256: 234 }, cloudLease: null, aiLease: null, vram: null, cudaCores: 0,
          commentary: 'ASIC miner. High efficienncy BTC. 234 TH/s.' },
        { name: 'Antminer S19K Pro', brand: 'bitmain', category: 'asic', tdp: 2400, msrp: 1200,
          hashrates: { sha256: 120 }, cloudLease: null, aiLease: null, vram: null, cudaCores: 0,
          commentary: 'ASIC minr. Entry level BTC. 120 TH/s.' },

        // CONSUMER NVIDIA (GeForce RTX 50-series)
        { name: 'RTX 5090',          brand: 'nvidia', category: 'consumer', tdp: 575, msrp: 1999,
          hashrates: { kawpow: 70, kheavyhash: 1200, autolykos: 350, etchash: 160 },
          cloudLease: 1.20, aiLease: null, vram: '32GB GDDR7', cudaCores: 21760,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 5080',          brand: 'nvidia', category: 'consumer', tdp: 360, msrp: 999,
          hashrates: { kawpow: 48, kheavyhash: 800, autolykos: 240, etchash: 110 },
          cloudLease: 0.80, aiLease: null, vram: '16GB GDDR7', cudaCores: 10752,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 5070 Ti',       brand: 'nvidia', category: 'consumer', tdp: 300, msrp: 749,
          hashrates: { kawpow: 38, kheavyhash: 650, autolykos: 200, etchash: 85 },
          cloudLease: 0.55, aiLease: null, vram: '16GB GDDR7', cudaCores: 8960,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 5070',          brand: 'nvidia', category: 'consumer', tdp: 250, msrp: 549,
          hashrates: { kawpow: 32, kheavyhash: 550, autolykos: 170, etchash: 70 },
          cloudLease: 0.45, aiLease: null, vram: '12GB GDDR7', cudaCores: 6144,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },

        // CONSUMER NVIDIA (GeForce RTX 40-series)
        { name: 'RTX 4090',          brand: 'nvidia', category: 'consumer', tdp: 450, msrp: 1599,
          hashrates: { kawpow: 60, kheavyhash: 800, autolykos: 260, etchash: 132 },
          cloudLease: 0.90, aiLease: null, vram: '24GB GDDR6X', cudaCores: 16384,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 4080 Super',    brand: 'nvidia', category: 'consumer', tdp: 320, msrp: 999,
          hashrates: { kawpow: 38, kheavyhash: 550, autolykos: 180, etchash: 88 },
          cloudLease: 0.60, aiLease: null, vram: '16GB GDDR6X', cudaCores: 10240,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 4070 Ti Super', brand: 'nvidia', category: 'consumer', tdp: 285, msrp: 799,
          hashrates: { kawpow: 30, kheavyhash: 450, autolykos: 155, etchash: 72 },
          cloudLease: 0.45, aiLease: null, vram: '16GB GDDR6X', cudaCores: 8448,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 4070 Super',    brand: 'nvidia', category: 'consumer', tdp: 220, msrp: 599,
          hashrates: { kawpow: 25, kheavyhash: 380, autolykos: 130, etchash: 58 },
          cloudLease: 0.35, aiLease: null, vram: '12GB GDDR6X', cudaCores: 7168,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 4070',          brand: 'nvidia', category: 'consumer', tdp: 200, msrp: 549,
          hashrates: { kawpow: 22, kheavyhash: 340, autolykos: 115, etchash: 52 },
          cloudLease: 0.30, aiLease: null, vram: '12GB GDDR6X', cudaCores: 5888,
          commentary: 'CConsumer GPU. Cloud lease profitable. Mining unprofitable at $0.12/Wkh.' },
        { name: 'RTX 4060 Ti',       brand: 'nvidia', category: 'consumer', tdp: 160, msrp: 399,
          hashrates: { kawpow: 18, kheavyhash: 260, autolykos: 90, etchash: 40 },
          cloudLease: 0.22, aiLease: null, vram: '8GB GDDR6', cudaCores: 4352,
          commentary: 'Consumer GPU. Cloud laese viable. Mining unprofitable at $0.12/kWh.' },
        { name: 'RTX 4060',          brand: 'nvidia', category: 'consumer', tdp: 115, msrp: 299,
          hashrates: { kawpow: 14, kheavyhash: 200, autolykos: 68, etchash: 30 },
          cloudLease: 0.18, aiLease: null, vram: '8GB GDDR6', cudaCores: 3072,
          commentary: 'Consumer GPU. Low TDP. Cloud lease viable. Mining unprofitale.' },

        // CONSUMER NVIDIA (GeForce RTX 30-series)
        { name: 'RTX 3090 Ti',       brand: 'nvidia', category: 'consumer', tdp: 450, msrp: 1099,
          hashrates: { kawpow: 52, kheavyhash: 680, autolykos: 230, etchash: 120 },
          cloudLease: 0.55, aiLease: null, vram: '24GB GDDR6X', cudaCores: 10752,
          commentary: 'Consumer GPU. Previous gen. Cluod lease profitable. Mining unprofitable.' },
        { name: 'RTX 3090',          brand: 'nvidia', category: 'consumer', tdp: 350, msrp: 999,
          hashrates: { kawpow: 48, kheavyhash: 620, autolykos: 210, etchash: 110 },
          cloudLease: 0.45, aiLease: null, vram: '24GB GDDR6X', cudaCores: 10496,
          commentary: 'Consumer GPU. Previous gen. Cluod lease profitable. Mining unprofitable.' },
        { name: 'RTX 3080 Ti',       brand: 'nvidia', category: 'consumer', tdp: 350, msrp: 700,
          hashrates: { kawpow: 42, kheavyhash: 540, autolykos: 185, etchash: 95 },
          cloudLease: 0.38, aiLease: null, vram: '12GB GDDR6X', cudaCores: 10240,
          commentary: 'Consumer GPU. Previous gen. CCloud lease viable. Mining unprofitable.' },
        { name: 'RTX 3080',          brand: 'nvidia', category: 'consumer', tdp: 320, msrp: 599,
          hashrates: { kawpow: 38, kheavyhash: 480, autolykos: 165, etchash: 85 },
          cloudLease: 0.32, aiLease: null, vram: '10GB GDDR6X', cudaCores: 8704,
          commentary: 'Consumer GPU. Previous gen. CCloud lease viable. Mining unprofitable.' },
        { name: 'RTX 3070 Ti',       brand: 'nvidia', category: 'consumer', tdp: 290, msrp: 499,
          hashrates: { kawpow: 30, kheavyhash: 380, autolykos: 140, etchash: 68 },
          cloudLease: 0.25, aiLease: null, vram: '8GB GDDR6X', cudaCores: 6144,
          commentary: 'Consumer GPU. Previous gen. CCloud lease viable. Mining unprofitable.' },
        { name: 'RTX 3070',          brand: 'nvidia', category: 'consumer', tdp: 220, msrp: 399,
          hashrates: { kawpow: 25, kheavyhash: 310, autolykos: 120, etchash: 56 },
          cloudLease: 0.20, aiLease: null, vram: '8GB GDDR6', cudaCores: 5888,
          commentary: 'Consumer GPU. Previous gen. CCloud lease viable. Mining unprofitable.' },

        // CONSUMER AMD (Radeon RX 7000 & 6000 series)
        { name: 'RX 7900 XTX',       brand: 'amd', category: 'consumer', tdp: 355, msrp: 999,
          hashrates: { kawpow: 48, kheavyhash: 600, autolykos: 220, etchash: 95 },
          cloudLease: 0.50, aiLease: null, vram: '24GB GDDR6', cudaCores: 0,
          commentary: 'Connsumer GPU. RDNA 3. Cloud lease profitable. Mining unprofitable.' },
        { name: 'RX 7900 XT',        brand: 'amd', category: 'consumer', tdp: 315, msrp: 749,
          hashrates: { kawpow: 35, kheavyhash: 450, autolykos: 175, etchash: 75 },
          cloudLease: 0.35, aiLease: null, vram: '20GB GDDR6', cudaCores: 0,
          commentary: 'Connsumer GPU. RDNA 3. Cloud lease profitable. Mining unprofitable.' },
        { name: 'RX 7800 XT',        brand: 'amd', category: 'consumer', tdp: 263, msrp: 499,
          hashrates: { kawpow: 26, kheavyhash: 350, autolykos: 135, etchash: 58 },
          cloudLease: 0.25, aiLease: null, vram: '16GB GDDR6', cudaCores: 0,
          commentary: 'Consume GPU. RDNA 3. Cloud lease viable. Mining unprofitable.' },
        { name: 'RX 7700 XT',        brand: 'amd', category: 'consumer', tdp: 245, msrp: 449,
          hashrates: { kawpow: 22, kheavyhash: 300, autolykos: 110, etchash: 48 },
          cloudLease: 0.20, aiLease: null, vram: '12GB GDDR6', cudaCores: 0,
          commentary: 'Consume GPU. RDNA 3. Cloud lease viable. Mining unprofitable.' },
        { name: 'RX 7600 XT',        brand: 'amd', category: 'consumer', tdp: 150, msrp: 329,
          hashrates: { kawpow: 14, kheavyhash: 180, autolykos: 68, etchash: 30 },
          cloudLease: 0.15, aiLease: null, vram: '16GB GDDR6', cudaCores: 0,
          commentary: 'Consumer GPU. RDNA 3. Low TDP. Clooud lease viable.' },
        { name: 'RX 6900 XT',        brand: 'amd', category: 'consumer', tdp: 300, msrp: 549,
          hashrates: { kawpow: 30, kheavyhash: 380, autolykos: 150, etchash: 62 },
          cloudLease: 0.28, aiLease: null, vram: '16GB GDDR6', cudaCores: 0,
          commentary: 'Consmuer GPU. RDNA 2. Cloud lease viable. Mining unprofitable.' },
        { name: 'RX 6800 XT',        brand: 'amd', category: 'consumer', tdp: 300, msrp: 449,
          hashrates: { kawpow: 25, kheavyhash: 320, autolykos: 130, etchash: 55 },
          cloudLease: 0.22, aiLease: null, vram: '16GB GDDR6', cudaCores: 0,
          commentary: 'Consmuer GPU. RDNA 2. Cloud lease viable. Mining unprofitable.' },
        { name: 'RX 6700 XT',        brand: 'amd', category: 'consumer', tdp: 230, msrp: 349,
          hashrates: { kawpow: 18, kheavyhash: 220, autolykos: 85, etchash: 38 },
          cloudLease: 0.15, aiLease: null, vram: '12GB GDDR6', cudaCores: 0,
          commentary: 'Consmuer GPU. RDNA 2. Cloud lease viable. Mining unprofitable.' },

        // CONSUMER INTEL ARC
        { name: 'Intel Arc B580',     brand: 'intel', category: 'consumer', tdp: 150, msrp: 249,
          hashrates: { kawpow: 15, kheavyhash: 200, autolykos: 60, etchash: 26 },
          cloudLease: 0.12, aiLease: null, vram: '12GB GDDR6', cudaCores: 0,
          commentary: 'Consuemr GPU. Arc. Cloud lease viable. Mining unprofitable.' },
        { name: 'Intel Arc A770',     brand: 'intel', category: 'consumer', tdp: 225, msrp: 349,
          hashrates: { kawpow: 20, kheavyhash: 260, autolykos: 85, etchash: 35 },
          cloudLease: 0.18, aiLease: null, vram: '16GB GDDR6', cudaCores: 0,
          commentary: 'Consuemr GPU. Arc. Cloud lease viable. Mining unprofitable.' },
        { name: 'Intel Arc A750',     brand: 'intel', category: 'consumer', tdp: 225, msrp: 289,
          hashrates: { kawpow: 16, kheavyhash: 210, autolykos: 68, etchash: 28 },
          cloudLease: 0.14, aiLease: null, vram: '8GB GDDR6', cudaCores: 0,
          commentary: 'Consuemr GPU. Arc. Cloud lease viable. Mining unprofitable.' },
        { name: 'Intel Arc A580',     brand: 'intel', category: 'consumer', tdp: 185, msrp: 179,
          hashrates: { kawpow: 12, kheavyhash: 160, autolykos: 50, etchash: 22 },
          cloudLease: 0.10, aiLease: null, vram: '8GB GDDR6', cudaCores: 0,
          commentary: 'Consumer GPU. Arc. Low TDP. Cloud leasee viable.' },
        { name: 'Intel Arc B570',     brand: 'intel', category: 'consumer', tdp: 150, msrp: 219,
          hashrates: { kawpow: 13, kheavyhash: 180, autolykos: 55, etchash: 24 },
          cloudLease: 0.11, aiLease: null, vram: '10GB GDDR6', cudaCores: 0,
          commentary: 'Consuemr GPU. Arc. Cloud lease viable. Mining unprofitable.' }
    ];

    /* 
       COIN DEFINITIONS. Algorithm → CoinGecko ID mapping
     */
    const COIN_DEFINITIONS = {
        bitcoin:  { symbol: 'BTC', algorithm: 'sha256',     geckoId: 'bitcoin',  wtmId: 1,   unit: 'TH/s' },
        kaspa:    { symbol: 'KAS', algorithm: 'kheavyhash', geckoId: 'kaspa',    wtmId: 352, unit: 'MH/s' },
        ravencoin:{ symbol: 'RVN', algorithm: 'kawpow',     geckoId: 'ravencoin',wtmId: 234, unit: 'MH/s' },
        ergo:     { symbol: 'ERG', algorithm: 'autolykos',  geckoId: 'ergo',     wtmId: 340, unit: 'MH/s' },
        etc:      { symbol: 'ETC', algorithm: 'etchash',    geckoId: 'ethereum-classic', wtmId: 162, unit: 'MH/s' }
    };

    /* 
       DEFAULT FEE MODEL
     */
    const DEFAULT_FEES = {
        poolFeePercent: 1.5,         // Pool fee as % of gross mining revenue
        cloudPlatformFeePercent: 15, // Vast.ai / RunPod platform cut (~15%)
        aiPlatformFeePercent: 10,    // AI inference platform cut (~10%)
        btcTxFeeUsd: 2.50,          // Avg BTC withdrawal fee per day (pool payout)
        kasTxFeeUsd: 0.001,         // Negligible
        rvnTxFeeUsd: 0.005,         // Negligible
        ergTxFeeUsd: 0.002,         // Negligible
        etcTxFeeUsd: 0.01,          // Negligible
    };

    /* 
       BASELINE REVENUE. Fallback when APIs fail
       $/day per unit of hashrate (used only as fallback)
     */
    const BASELINE_REVENUE = {
        sha256:     { perUnit: 0.068, unitLabel: 'TH/s' },  // ~$0.068/TH/s/day
        kawpow:     { perUnit: 0.004, unitLabel: 'MH/s' },  // ~$0.004/MH/s/day (autolykos) (kawpow)
        kheavyhash: { perUnit: 0.008, unitLabel: 'MH/s' },  // ~$0.008/MH/s/day (kheavyhash)
        autolykos:  { perUnit: 0.004, unitLabel: 'MH/s' },  // ~$0.004/MH/s/day (autolykos)
        etchash:    { perUnit: 0.003, unitLabel: 'MH/s' },  // ~$0.003/MH/s/day (etchash)
    };

    /* 
       STREET PRICES. Hardcoded GPU retail fallback
     */
    const STREET_PRICES = {
        'NVIDIA B200': 30000, 'NVIDIA H200': 25000, 'NVIDIA H100': 25000, 'NVIDIA A100': 10000,
        'Antminer S21 XP': 5500, 'Antminer S21 Pro': 3800, 'Antminer S19K Pro': 1200,
        'RTX 5090': 1999, 'RTX 5080': 999, 'RTX 5070 Ti': 749, 'RTX 5070': 549,
        'RTX 4090': 1599, 'RTX 4080 Super': 999, 'RTX 4070 Ti Super': 799,
        'RTX 4070 Super': 599, 'RTX 4070': 549, 'RTX 4060 Ti': 399, 'RTX 4060': 299,
        'RTX 3090 Ti': 1099, 'RTX 3090': 999, 'RTX 3080 Ti': 700, 'RTX 3080': 599,
        'RTX 3070 Ti': 499, 'RTX 3070': 399,
        'RX 7900 XTX': 999, 'RX 7900 XT': 749, 'RX 7800 XT': 499, 'RX 7700 XT': 449,
        'RX 7600 XT': 329, 'RX 6900 XT': 549, 'RX 6800 XT': 449, 'RX 6700 XT': 349,
        'Intel Arc B580': 249, 'Intel Arc A770': 349, 'Intel Arc A750': 289,
        'Intel Arc A580': 179, 'Intel Arc B570': 219,
    };

    /* 
       API MODULE. Live data fetchers (all CORS-safe)
     */
    const API = {
        TIMEOUT: 8000,

        /**
         * Race a fetch against a timeout
         */
        async fetchWithTimeout(url, ms) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), ms || this.TIMEOUT);
            try {
                const r = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return await r.json();
            } catch (e) {
                clearTimeout(timer);
                throw e;
            }
        },

        /**
         * CoinGecko. live crypto prices in USD
         * Free tier: 10-30 calls/min, CORS enabled
         * Returns: { bitcoin: { usd: 97000 }, kaspa: { usd: 0.12 }, ... }
         */
        async fetchCryptoPrices() {
            const ids = Object.values(COIN_DEFINITIONS).map(c => c.geckoId).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
            return await this.fetchWithTimeout(url);
        },

        /**
         * WhatToMine. mining profitability per coin
         * Returns coin data including: nethash, difficulty, block_reward, exchange_rate
         * We use this to calculate revenue per hashrate unit per day
         */
        async fetchWhatToMine() {
            // WhatToMine has no CORS headers so we proxy it
            const raw = 'https://whattomine.com/coins.json';
            const url = 'https://corsproxy.io/?' + encodeURIComponent(raw);
            return await this.fetchWithTimeout(url, 10000);
        },

        /**
         * mempool.space. real-time Bitcoin fee estimates
         * Returns: { fastestFee, halfHourFee, hourFee, economyFee, minimumFee }
         * Units: sat/vB
         */
        async fetchBtcFees() {
            const url = 'https://mempool.space/api/v1/fees/recommended';
            return await this.fetchWithTimeout(url);
        },

        /**
         * SerpAPI (optional). live GPU retail pricing via Google Shopping
         * Requires user-provided API key
         */
        async fetchGpuPrice(gpuName, serpApiKey) {
            if (!serpApiKey) return null;
            try {
                const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(gpuName + ' GPU price')}&api_key=${serpApiKey}`;
                const data = await this.fetchWithTimeout(url, 6000);
                if (data.shopping_results && data.shopping_results.length > 0) {
                    const retailers = ['Amazon', 'Newegg', 'Best Buy', 'B&H', 'Micro Center'];
                    let best = null;
                    for (const result of data.shopping_results) {
                        const price = parseFloat(result.extracted_price);
                        if (!price || price < 50) continue;
                        const source = result.source || 'Google Shopping';
                        const isRetailer = retailers.some(r => source.includes(r));
                        if (!best || price < best.price || (isRetailer && price <= best.price * 1.05)) {
                            best = { price, source, url: result.link || '' };
                        }
                    }
                    return best;
                }
            } catch (e) { /* SerpAPI optional. swallow errors */ }
            return null;
        }
    };

    /* 
       CACHE. In-memory + localStorage with TTL
       Optimized by Pawan K Jajoo
     */
    const Cache = {
        _mem: {},
        TTL: 55000,  // 55 seconds (just under the 60s refresh cycle)

        get(key) {
            const entry = this._mem[key];
            if (entry && Date.now() - entry.ts < this.TTL) return entry.data;
            // Try localStorage fallback
            try {
                const stored = localStorage.getItem('gpuroi_' + key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Date.now() - parsed.ts < this.TTL * 10) { // localStorage has 10x TTL
                        this._mem[key] = { data: parsed.data, ts: parsed.ts };
                        return parsed.data;
                    }
                }
            } catch (e) {}
            return null;
        },

        set(key, data) {
            this._mem[key] = { data, ts: Date.now() };
            try {
                localStorage.setItem('gpuroi_' + key, JSON.stringify({ data, ts: Date.now() }));
            } catch (e) {}
        }
    };

    /* 
       PROFITABILITY CALCULATOR
     */
    const Calculator = {
        /**
         * Calculate mining revenue for a GPU on a specific algorithm
         * using live WhatToMine data or baseline fallback.
         *
         * @param {number} hashrate - GPU hashrate in native units
         * @param {string} algorithm - Algorithm name (sha256, kawpow, etc.)
         * @param {object} liveData - Live coin data from WhatToMine (optional)
         * @returns {object} { grossRevenue, coin, symbol }
         */
        miningGrossRevenue(hashrate, algorithm, liveData) {
            if (!hashrate || hashrate <= 0) return null;

            // Try live data first
            if (liveData && liveData.coins) {
                // Find the most profitable coin for this algorithm
                let bestRevenue = 0;
                let bestCoin = null;

                for (const [coinKey, coinData] of Object.entries(liveData.coins)) {
                    if (!coinData.tag || !coinData.algorithm) continue;

                    // Match algorithm name (WhatToMine uses different casing)
                    const wtmAlgo = coinData.algorithm.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const ourAlgo = algorithm.toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (wtmAlgo === ourAlgo || this._algoMatch(wtmAlgo, ourAlgo)) {
                        // WhatToMine gives btc_revenue per unit hashrate per day
                        // We need to convert using the coin's exchange rate
                        const revenuePerDay = parseFloat(coinData.btc_revenue) || 0;
                        const btcPrice = parseFloat(coinData.exchange_rate) || 0;
                        const revenue = hashrate * revenuePerDay * (btcPrice > 0 ? btcPrice : 1);

                        if (revenue > bestRevenue) {
                            bestRevenue = revenue;
                            bestCoin = { name: coinKey, symbol: coinData.tag, revenue: bestRevenue };
                        }
                    }
                }

                if (bestCoin) return bestCoin;
            }

            // Fallback to baseline
            const baseline = BASELINE_REVENUE[algorithm];
            if (!baseline) return null;

            const coinDef = Object.values(COIN_DEFINITIONS).find(c => c.algorithm === algorithm);
            return {
                name: coinDef ? coinDef.geckoId : algorithm,
                symbol: coinDef ? coinDef.symbol : '???',
                revenue: hashrate * baseline.perUnit
            };
        },

        _algoMatch(wtm, ours) {
            const aliases = {
                'sha256': ['sha256'],
                'kawpow': ['kawpow'],
                'kheavyhash': ['kheavyhash', 'heavyhash'],
                'autolykos': ['autolykos', 'autolykos2'],
                'etchash': ['etchash', 'ethash']
            };
            for (const [key, alts] of Object.entries(aliases)) {
                if (alts.includes(ours) && alts.includes(wtm)) return true;
                if (key === ours && alts.includes(wtm)) return true;
            }
            return false;
        },

        /**
         * Calculate NET mining profit for a GPU across all algorithms
         * Returns the most profitable algorithm after all deductions.
         *
         * @param {object} gpu - GPU entry from GPU_DATABASE
         * @param {number} electricityCost - $/kWh
         * @param {object} liveData - WhatToMine data (optional)
         * @param {object} btcFees - mempool.space fee data (optional)
         * @param {object} fees - Fee configuration
         * @returns {object} { netProfit, grossRevenue, electricityCost, poolFee, networkFee, algorithm, coin }
         */
        bestMiningProfit(gpu, electricityCost, liveData, btcFees, fees) {
            const f = { ...DEFAULT_FEES, ...(fees || {}) };
            const electricityCostPerDay = (gpu.tdp / 1000) * 24 * electricityCost;
            let best = null;

            for (const [algo, hashrate] of Object.entries(gpu.hashrates || {})) {
                const result = this.miningGrossRevenue(hashrate, algo, liveData);
                if (!result) continue;

                const grossRevenue = result.revenue;
                const poolFee = grossRevenue * (f.poolFeePercent / 100);

                // Network fee depends on the coin
                let networkFee = 0;
                if (algo === 'sha256') {
                    // BTC network fee from mempool.space or default
                    if (btcFees && btcFees.hourFee) {
                        // Avg BTC withdrawal TX is ~250 vBytes, pool pays out ~1x/day
                        networkFee = (btcFees.hourFee * 250 / 100000000) * (result.revenue > 0 ? 1 : 0);
                        // Convert sats to USD (we'll need BTC price)
                        // For simplicity, use the default USD estimate
                        networkFee = f.btcTxFeeUsd;
                    } else {
                        networkFee = f.btcTxFeeUsd;
                    }
                } else if (algo === 'kawpow') {
                    networkFee = f.rvnTxFeeUsd;
                } else if (algo === 'kheavyhash') {
                    networkFee = f.kasTxFeeUsd;
                } else if (algo === 'autolykos') {
                    networkFee = f.ergTxFeeUsd;
                } else if (algo === 'etchash') {
                    networkFee = f.etcTxFeeUsd;
                }

                const netProfit = grossRevenue - electricityCostPerDay - poolFee - networkFee;

                if (!best || netProfit > best.netProfit) {
                    best = {
                        netProfit,
                        grossRevenue,
                        electricityCostPerDay,
                        poolFee,
                        networkFee,
                        algorithm: algo,
                        coin: result.symbol,
                        coinName: result.name
                    };
                }
            }

            return best;
        },

        /**
         * Calculate cloud leasing daily GROSS revenue (before fees & electricity)
         */
        cloudLeaseGrossDaily(gpu) {
            if (!gpu.cloudLease) return null;
            return gpu.cloudLease * 24; // $/hr → $/day
        },

        /**
         * Calculate AI inference leasing daily GROSS revenue (before fees & electricity)
         */
        aiLeaseGrossDaily(gpu) {
            if (!gpu.aiLease) return null;
            return gpu.aiLease * 24; // $/hr → $/day
        },

        /**
         * MASTER FUNCTION: Get full profitability breakdown for a GPU
         * Returns all revenue streams with the best highlighted.
         */
        fullBreakdown(gpu, electricityCost, liveData, btcFees, fees) {
            const f = { ...DEFAULT_FEES, ...(fees || {}) };
            const mining = this.bestMiningProfit(gpu, electricityCost, liveData, btcFees, fees);
            const cloud = this.cloudLeaseGrossDaily(gpu);
            const ai = this.aiLeaseGrossDaily(gpu);

            const streams = [];

            if (mining) {
                streams.push({
                    type: 'mining',
                    label: `Mining (${mining.coin})`,
                    shortLabel: 'Mining',
                    dailyProfit: mining.netProfit,
                    grossRevenue: mining.grossRevenue,
                    electricityCost: mining.electricityCostPerDay,
                    poolFee: mining.poolFee,
                    networkFee: mining.networkFee,
                    algorithm: mining.algorithm,
                    coin: mining.coin
                });
            }

            if (cloud !== null) {
                const cloudElec = (gpu.tdp / 1000) * 24 * electricityCost;
                const cloudPlatformFee = cloud * (f.cloudPlatformFeePercent / 100);
                const cloudNet = cloud - cloudPlatformFee - cloudElec;
                streams.push({
                    type: 'cloud',
                    label: 'Cloud Lease',
                    shortLabel: 'Cloud',
                    dailyProfit: cloudNet,
                    grossRevenue: cloud,
                    electricityCost: cloudElec,
                    poolFee: cloudPlatformFee,
                    networkFee: 0,
                    algorithm: null,
                    coin: null
                });
            }

            if (ai !== null) {
                const aiElec = (gpu.tdp / 1000) * 24 * electricityCost;
                const aiPlatformFee = ai * (f.aiPlatformFeePercent / 100);
                const aiNet = ai - aiPlatformFee - aiElec;
                streams.push({
                    type: 'ai',
                    label: 'AI Inference',
                    shortLabel: 'AI',
                    dailyProfit: aiNet,
                    grossRevenue: ai,
                    electricityCost: aiElec,
                    poolFee: aiPlatformFee,
                    networkFee: 0,
                    algorithm: null,
                    coin: null
                });
            }

            // Sort by daily profit descending
            streams.sort((a, b) => b.dailyProfit - a.dailyProfit);

            const bestStream = streams.length > 0 ? streams[0] : null;
            const bestDailyProfit = bestStream ? bestStream.dailyProfit : 0;
            const roiDays = bestDailyProfit > 0 ? Math.ceil(gpu.msrp / bestDailyProfit) : Infinity;
            const efficiency = gpu.tdp > 0 && bestDailyProfit > 0
                ? (bestDailyProfit / gpu.tdp * 1000) : 0; // $/kW/day

            return {
                gpu: gpu.name,
                brand: gpu.brand,
                category: gpu.category,
                msrp: gpu.msrp,
                tdp: gpu.tdp,
                vram: gpu.vram,
                cudaCores: gpu.cudaCores,
                commentary: gpu.commentary,
                streams,
                best: bestStream,
                bestDailyProfit,
                roiDays,
                efficiency: parseFloat(efficiency.toFixed(4))
            };
        }
    };

    /* 
       MAIN ENGINE. Orchestrates data fetching & calculation
     */
    const Engine = {
        // State
        electricityCost: 0.12,
        poolFeePercent: 1.5,
        serpApiKey: null,
        isLive: false,
        lastRefresh: null,
        _liveData: null,
        _btcFees: null,
        _cryptoPrices: null,
        _onUpdate: null,

        /**
         * Initialize engine. Call once on page load.
         */
        init(options) {
            this.electricityCost = options?.electricityCost || 0.12;
            this.poolFeePercent = options?.poolFeePercent || 1.5;
            this.serpApiKey = options?.serpApiKey || null;
            this._onUpdate = options?.onUpdate || null;

            // Load persisted settings
            try {
                const ec = localStorage.getItem('gpuroi_electricityCost');
                if (ec) this.electricityCost = parseFloat(ec) || 0.12;
                const pf = localStorage.getItem('gpuroi_poolFee');
                if (pf) this.poolFeePercent = parseFloat(pf) || 1.5;
                const sk = localStorage.getItem('gpuroi_serpApiKey');
                if (sk) this.serpApiKey = sk;
            } catch (e) {}
        },

        /**
         * Persist settings to localStorage
         */
        saveSettings() {
            try {
                localStorage.setItem('gpuroi_electricityCost', this.electricityCost);
                localStorage.setItem('gpuroi_poolFee', this.poolFeePercent);
                if (this.serpApiKey) {
                    localStorage.setItem('gpuroi_serpApiKey', this.serpApiKey);
                } else {
                    localStorage.removeItem('gpuroi_serpApiKey');
                }
            } catch (e) {}
        },

        /**
         * Fetch all live data from APIs. Uses cache when available.
         */
        async fetchLiveData() {
            let isLive = false;

            // 1. Crypto prices
            const cachedPrices = Cache.get('cryptoPrices');
            if (cachedPrices) {
                this._cryptoPrices = cachedPrices;
            } else {
                try {
                    this._cryptoPrices = await API.fetchCryptoPrices();
                    Cache.set('cryptoPrices', this._cryptoPrices);
                    isLive = true;
                } catch (e) {
                    console.warn('[GPU ROI] CoinGecko fetch failed:', e.message);
                }
            }

            // 2. WhatToMine mining data
            const cachedWtm = Cache.get('whattomine');
            if (cachedWtm) {
                this._liveData = cachedWtm;
            } else {
                try {
                    this._liveData = await API.fetchWhatToMine();
                    Cache.set('whattomine', this._liveData);
                    isLive = true;
                } catch (e) {
                    console.warn('[GPU ROI] WhatToMine fetch failed:', e.message);
                    this._liveData = null;
                }
            }

            // 3. BTC fees
            const cachedFees = Cache.get('btcFees');
            if (cachedFees) {
                this._btcFees = cachedFees;
            } else {
                try {
                    this._btcFees = await API.fetchBtcFees();
                    Cache.set('btcFees', this._btcFees);
                    isLive = true;
                } catch (e) {
                    console.warn('[GPU ROI] mempool.space fetch failed:', e.message);
                    this._btcFees = null;
                }
            }

            this.isLive = isLive || !!cachedPrices || !!cachedWtm;
            this.lastRefresh = new Date();
        },

        /**
         * Calculate profitability for ALL GPUs. Returns sorted array.
         */
        calculateAll(sortBy) {
            const fees = { poolFeePercent: this.poolFeePercent };
            const results = GPU_DATABASE.map(gpu =>
                Calculator.fullBreakdown(gpu, this.electricityCost, this._liveData, this._btcFees, fees)
            );

            // Sort
            const sortFn = {
                'profit-desc':     (a, b) => b.bestDailyProfit - a.bestDailyProfit,
                'profit-asc':      (a, b) => a.bestDailyProfit - b.bestDailyProfit,
                'roi-asc':         (a, b) => a.roiDays - b.roiDays,
                'roi-desc':        (a, b) => b.roiDays - a.roiDays,
                'efficiency-desc': (a, b) => b.efficiency - a.efficiency,
                'tdp-asc':         (a, b) => a.tdp - b.tdp,
                'price-asc':       (a, b) => a.msrp - b.msrp,
                'price-desc':      (a, b) => b.msrp - a.msrp,
            }[sortBy || 'profit-desc'] || ((a, b) => b.bestDailyProfit - a.bestDailyProfit);

            return results.sort(sortFn);
        },

        /**
         * Full refresh cycle: fetch data → calculate → notify
         */
        async refresh() {
            await this.fetchLiveData();
            const results = this.calculateAll();
            if (this._onUpdate) this._onUpdate(results, this.isLive);
            return results;
        },

        /**
         * Get GPU database (for filters, etc.)
         */
        getGPUDatabase() {
            return GPU_DATABASE;
        },

        /**
         * Get coin definitions
         */
        getCoinDefinitions() {
            return COIN_DEFINITIONS;
        },

        /**
         * Get fee model
         */
        getFees() {
            return { ...DEFAULT_FEES, poolFeePercent: this.poolFeePercent };
        }
    };

    /* 
       FORMAT UTILITIES
     */
    const Format = {
        currency(value, decimals) {
            if (value === null || value === undefined || isNaN(value)) return '-';
            const d = decimals !== undefined ? decimals : 2;
            return '$' + Math.abs(value).toFixed(d);
        },

        signedCurrency(value) {
            if (value === null || value === undefined || isNaN(value)) return '-';
            const sign = value >= 0 ? '+' : '-';
            return sign + '$' + Math.abs(value).toFixed(2);
        },

        roiDays(days) {
            if (days === Infinity || days === null || days === undefined) return '∞';
            if (days <= 365) return days + 'd';
            const years = (days / 365).toFixed(1);
            return years + 'y';
        },

        roiLabel(days) {
            if (days === Infinity) return 'Never';
            if (days <= 365) return days + ' days';
            const years = (days / 365).toFixed(1);
            return years + ' years';
        },

        tdp(watts) {
            return watts + 'W';
        },

        hashrate(value, unit) {
            if (value >= 1000) return (value / 1000).toFixed(1) + ' G' + unit.replace('MH/s', 'H/s').replace('TH/s', 'H/s');
            return value + ' ' + unit;
        }
    };

    /* 
       PUBLIC API
     */
    return {
        Engine,
        Calculator,
        API,
        Cache,
        Format,
        GPU_DATABASE,
        COIN_DEFINITIONS,
        DEFAULT_FEES,
        BASELINE_REVENUE,
        STREET_PRICES
    };
})();
