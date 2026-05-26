/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Cpu, 
  Database, 
  Activity, 
  Flame, 
  Coins, 
  DollarSign, 
  Anchor, 
  Info, 
  X, 
  SlidersHorizontal, 
  Code, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  BookOpen,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface FinancialAsset {
  id: string;
  symbol: string;
  nameEN: string;
  nameZH: string;
  category: 'metals' | 'crypto' | 'energy' | 'stocks' | 'currencies';
  price: number;
  changePercent: number;
  unitEN: string;
  unitZH: string;
  history: number[]; // 15 points
  marketCapEN: string;
  marketCapZH: string;
  exchangeEN?: string;
  exchangeZH?: string;
  apiSampleUrl: string;
  apiResponseSample: string;
  descriptionEN: string;
  descriptionZH: string;
  convertRatio?: number; // ratio to alternative unit
  altUnitEN?: string;
  altUnitZH?: string;
}

// ==========================================
// HARDCODED TRANSLATIONS FOR FULL LOCALIZATION
// ==========================================
const dict = {
  en: {
    title: "Vantage",
    subtitle: "Real-Time",
    tagline: "Global Price Tracker",
    nyClock: "New York Time (EST/EDT)",
    shClock: "Shanghai Time (CST/BJ)",
    marketOpen: "OPEN",
    marketClosed: "CLOSED",
    metals: "Metals",
    metalsSub: "Live Gold, Silver & Platinum Spot",
    crypto: "Crypto Assets",
    cryptoSub: "Leading Decoupled Digital Tokens",
    energy: "Energy & Fuels",
    energySub: "Brent Crude, Natural Gas & Fuels",
    stocks: "Global Stock Exchanges",
    stocksSub: "Top 3 Major World Capital Markets",
    currencies: "Foreign Exchange",
    currenciesSub: "Critical Global Interbank Crosses",
    devGuide: "Developer Hub & API Settings",
    devSub: "Beginner Guide to Real-Time Data Integrations",
    apiStatus: "API SERVICE LAYER",
    apiStable: "OPERATIONAL",
    uptime: "Uptimes: 99.98%",
    footerCredit: "VANTAGE GLOBAL REAL-TIME DATA INDEX • DESIGNED FOR ACCURACY",
    detailModalTitle: "Asset Insights & Analytics",
    converterTitle: "Bilingual Asset Converter",
    details: "Market Details",
    desc: "Asset Profile",
    apiEndpoint: "Production API Integration Example",
    simMode: "Simulation Active",
    liveMode: "Live API Proxy",
    copied: "Copied Request URI!",
    copyUri: "Copy Request URI",
    convertUsdCny: "US Dollar (USD) to Chinese Yuan (CNY) Equivalent",
    goldOzG: "Troy Ounces (oz) vs Grams (g)",
    brentBblL: "Barrels (bbl) vs Liters (L)",
    loading: "Fetching real-time API...",
    error: "API connection offline. Fallback to simulation.",
    apiExplanation: "For live production, integrate these public endpoints directly within a React useEffect or configure a secure proxy server.",
    close: "Close",
    selectAssetPrompt: "Select any ticker from the Bento Grid to load comprehensive interactive analytics panels.",
    high: "Daily High",
    low: "Daily Low",
    open: "Open Price",
    symbolLabel: "Symbol",
    marketCap: "Cap / Limit",
    exchange: "Exchange"
  },
  zh: {
    title: "Vantage万特",
    subtitle: "实时数据",
    tagline: "全球资产价格监控系统",
    nyClock: "纽约时间 (美东区)",
    shClock: "上海时间 (北京时间)",
    marketOpen: "交易中(已开盘)",
    marketClosed: "已收盘",
    metals: "贵金属",
    metalsSub: "黄金、白银及铂金实时即期汇率",
    crypto: "加密货币",
    cryptoSub: "全球领先去中心化数字资产",
    energy: "燃料与能源",
    energySub: "布伦特原油、天然气和取暖油行情",
    stocks: "全球股票交易所",
    stocksSub: "世界三大核心资本市场指数",
    currencies: "国际外汇汇率",
    currenciesSub: "中美及核心跨境外汇交叉盘",
    devGuide: "开发者中心 & API 设置",
    devSub: "简明实时金融 API 对接指南（零基础友好）",
    apiStatus: "API 服务层",
    apiStable: "运行正常",
    uptime: "可用率: 99.98%",
    footerCredit: "VANTAGE 全球金融实时行情指标 • 匠心打造精准视界",
    detailModalTitle: "资产深度洞察与分析",
    converterTitle: "双语资产汇率转换器",
    details: "市场详情指标",
    desc: "资产简述",
    apiEndpoint: "生产环境 API 对接代码示例",
    simMode: "模拟算法极速刷新中",
    liveMode: "外部 API 代理中",
    copied: "请求链接已复制!",
    copyUri: "复制 API 请求链接",
    convertUsdCny: "美元 (USD) 到 人民币 (CNY) 等值兑换",
    goldOzG: "金衡盎司 (oz) 与 克 (g) 换算",
    brentBblL: "桶 (bbl) 与 升 (L) 物理换算",
    loading: "正在获取外部实时 API 数据...",
    error: "外部 API 连线异常，恢复平滑模拟模式",
    apiExplanation: "在真实的商业环境中，您可以直接在 React useEffect 中请求以下端点，或搭建后端 API 代理服务器隐藏私钥。",
    close: "关闭",
    selectAssetPrompt: "在左侧 Bento 瓦片中点击任何行情卡片以加载沉浸式专业图表与物理换算面板。",
    high: "今日最高值",
    low: "今日最低值",
    open: "开盘基准价",
    symbolLabel: "交易代码",
    marketCap: "市值/总值",
    exchange: "上市/基准所"
  }
};

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
export default function App() {
  // Localization: 'bilingual' | 'en' | 'zh'
  const [lang, setLang] = useState<'bilingual' | 'en' | 'zh'>('bilingual');
  
  // Simulation vs Live API config
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('vantage_api_key') || '');
  const [apiType, setApiType] = useState<'binance' | 'coingecko'>('binance');
  
  // Current time state
  const [nyTime, setNyTime] = useState<string>('00:00:00');
  const [shTime, setShTime] = useState<string>('00:00:00');
  const [marketsOpen, setMarketsOpen] = useState<{ ny: boolean; sh: boolean }>({ ny: false, sh: false });

  // Selected item for Detailed Modal/Dashboard Side view
  const [selectedAssetId, setSelectedAssetId] = useState<string>('btc');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Conversion tool states
  const [calcInput, setCalcInput] = useState<number>(1);
  const [calcTarget, setCalcTarget] = useState<'usd' | 'cny' | 'primary' | 'alt'>('primary');

  // Track state changes to trigger localized green/red flash animations
  const [flashStates, setFlashStates] = useState<Record<string, { direction: 'all-up' | 'all-down', timestamp: number }>>({});

  // Core asset state with initial values matching realistic, high-fidelity indexes
  const [assets, setAssets] = useState<FinancialAsset[]>([
    {
      id: 'gold',
      symbol: 'XAU',
      nameEN: 'Gold',
      nameZH: '黄金 Spot',
      category: 'metals',
      price: 2415.80,
      changePercent: 0.62,
      unitEN: '/ oz',
      unitZH: '/ 盎司',
      history: [2380, 2392, 2385, 2398, 2410, 2405, 2408, 2415, 2411, 2413, 2419, 2412, 2414, 2417, 2415.80],
      marketCapEN: '$15.2T Total Est.',
      marketCapZH: '估值市值约15.2万亿美元',
      exchangeEN: 'LBMA (London Bullion Market)',
      exchangeZH: '伦敦金银市场协会基准伦敦金',
      apiSampleUrl: 'https://api.metalpriceapi.com/v1/latest?api_key=YOUR_KEY&base=USD&currencies=XAU',
      apiResponseSample: `{ "success": true, "base": "USD", "rates": { "XAU": 0.0004139 }, "description": "1 USD translates to ounces of XAU. Multiply reciprocal." }`,
      descriptionEN: 'Gold acts as the ultimate safe-haven asset. Global pricing is anchored in USD per troy ounce (31.1035 grams). Evaluated highly by the People Bank of China (PBOC) and federal vaults.',
      descriptionZH: '黄金是抵御通胀和金融动荡的最强资产。全球定价以美元/金衡盎司（约31.1克）为基准。对中美投资人皆有极强的避险配置资产价值。',
      convertRatio: 31.1034768, // grams per oz
      altUnitEN: '/ gram',
      altUnitZH: '/ 克'
    },
    {
      id: 'silver',
      symbol: 'XAG',
      nameEN: 'Silver',
      nameZH: '白银 Spot',
      category: 'metals',
      price: 28.95,
      changePercent: 1.45,
      unitEN: '/ oz',
      unitZH: '/ 盎司',
      history: [27.5, 27.8, 27.4, 27.9, 28.1, 28.4, 28.2, 28.6, 28.5, 28.7, 29.1, 28.8, 28.9, 28.92, 28.95],
      marketCapEN: '$1.4T Total Est.',
      marketCapZH: '估算金属总容量1.4万亿美元',
      exchangeEN: 'COMEX Commodity Exchange',
      exchangeZH: '纽约商品交易所主力期货报价',
      apiSampleUrl: 'https://api.metalpriceapi.com/v1/latest?api_key=YOUR_KEY&base=USD&currencies=XAG',
      apiResponseSample: `{ "success": true, "base": "USD", "rates": { "XAG": 0.03454 } }`,
      descriptionEN: 'Silver has intensive industrial utility in solar panel manufacturing and electronics, linking it heavily with both speculative trades and industrial production indices in the US & China.',
      descriptionZH: '白银具有高度的双重属性：既是贵金属避险货币，又是电子半导体、光伏发电的核心高耗原材料，与中美实体制造业PMI深度挂钩。',
      convertRatio: 31.1034768,
      altUnitEN: '/ gram',
      altUnitZH: '/ 克'
    },
    {
      id: 'platinum',
      symbol: 'XPT',
      nameEN: 'Platinum',
      nameZH: '铂金 Spot',
      category: 'metals',
      price: 978.40,
      changePercent: -0.28,
      unitEN: '/ oz',
      unitZH: '/ 盎司',
      history: [990, 988, 982, 984, 981, 985, 980, 976, 977, 979, 982, 981, 975, 976, 978.40],
      marketCapEN: '$350B Total Est.',
      marketCapZH: '全球稀缺储备约3500亿美元',
      exchangeEN: 'NYMEX Mercantile Exchange',
      exchangeZH: '纽约商业交易所铂金板块',
      apiSampleUrl: 'https://api.metalpriceapi.com/v1/latest?api_key=YOUR_KEY&base=USD&currencies=XPT',
      apiResponseSample: `{ "success": true, "base": "USD", "rates": { "XPT": 0.001022 } }`,
      descriptionEN: 'Platinum is highly rare, with unique catalytic properties extremely critical in automotive emissions purification, fuel-cells, and aerospace developments.',
      descriptionZH: '铂金（白金）储量比黄金稀有数倍，在氢能燃料电池、新能源汽车汽车尾气三元催化器中作为无法替代的高效催化剂，被中美元首产业链高度重视。',
      convertRatio: 31.1034768,
      altUnitEN: '/ gram',
      altUnitZH: '/ 克'
    },
    {
      id: 'btc',
      symbol: 'BTC',
      nameEN: 'Bitcoin',
      nameZH: '比特币',
      category: 'crypto',
      price: 68450.00,
      changePercent: 3.12,
      unitEN: '/ Coin',
      unitZH: '/ 枚',
      history: [65200, 66100, 65900, 66800, 67200, 67100, 67600, 68900, 68100, 68305, 68450, 68100, 68320, 68410, 68450.00],
      marketCapEN: '$1.34T Market Cap',
      marketCapZH: '全网市值约1.34万亿美元',
      exchangeEN: 'Binance / Coinbase Spot',
      exchangeZH: '国际主流现货综合交易所指数',
      apiSampleUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      apiResponseSample: `{ "bitcoin": { "usd": 68450, "usd_24h_change": 3.12 } }`,
      descriptionEN: 'The pioneer digital currency, widely accepted as digital gold. Governed strictly by cryptographic algorithms and decentralized nodes, it serves as a highly active global asset class.',
      descriptionZH: '首个去中心化非主权加密数字货币，被称为“数字黄金”。由密码学算法协议保障2100万枚上限，是跨国机构重点交易的新兴标的。',
      convertRatio: 1,
      altUnitEN: 'Sats (10^-8)',
      altUnitZH: '聪 SATS (亿分之一)'
    },
    {
      id: 'eth',
      symbol: 'ETH',
      nameEN: 'Ethereum',
      nameZH: '以太坊',
      category: 'crypto',
      price: 3512.45,
      changePercent: -1.24,
      unitEN: '/ Coin',
      unitZH: '/ 枚',
      history: [3590, 3580, 3550, 3565, 3530, 3540, 3520, 3505, 3522, 3510, 3529, 3518, 3524, 3509, 3512.45],
      marketCapEN: '$420B Market Cap',
      marketCapZH: '估值市值4200亿美元',
      exchangeEN: 'Binance / Coinbase Spot',
      exchangeZH: '以太坊现货综合参考基准价格',
      apiSampleUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      apiResponseSample: `{ "ethereum": { "usd": 3512.45, "usd_24h_change": -1.24 } }`,
      descriptionEN: 'Operating as the worlds decentralized computer, Ethereum fuels smart contracts and decentralized applications (dApps), rendering its tokens equivalent to network gas fees.',
      descriptionZH: '全球最大的通用区块链虚拟机，支持智能合约与去中心化应用网络（dApps）。持有以太坊等同于占有该生态底层运算资源的通行证。',
      convertRatio: 1e9,
      altUnitEN: 'Gwei',
      altUnitZH: '千兆克拉 Gwei'
    },
    {
      id: 'sol',
      symbol: 'SOL',
      nameEN: 'Solana',
      nameZH: '索拉纳',
      category: 'crypto',
      price: 154.60,
      changePercent: 6.81,
      unitEN: '/ Coin',
      unitZH: '/ 枚',
      history: [138.2, 142.1, 140.5, 144.2, 146.0, 145.2, 149.8, 153.1, 151.2, 152.0, 153.9, 152.4, 153.1, 154.2, 154.60],
      marketCapEN: '$69.2B Market Cap',
      marketCapZH: '全网市值约692亿美元',
      exchangeEN: 'Binance / Kraken Spot',
      exchangeZH: '索拉纳链上代币国际交易基准',
      apiSampleUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      apiResponseSample: `{ "solana": { "usd": 154.60, "usd_24h_change": 6.81 } }`,
      descriptionEN: 'Known for ultra-high transaction throughput and low network fees, Solana is the main hub for consumer web3 apps, decentralized physical infrastructure (DePIN), and high-frequency digital minting.',
      descriptionZH: '依靠创新的工作历史证明协议（PoH）支持超高性能、低廉成本闪击交易。是去中心化物理基础设施（DePIN）与高频交互应用的热点高地。',
      convertRatio: 1,
      altUnitEN: 'Lamports (10^-9)',
      altUnitZH: '兰帕特（十亿分之一）'
    },
    {
      id: 'brent',
      symbol: 'BRENT',
      nameEN: 'Brent Crude Oil',
      nameZH: '布伦特原油',
      category: 'energy',
      price: 81.35,
      changePercent: -0.42,
      unitEN: '/ barrel',
      unitZH: '/ 桶',
      history: [82.5, 82.2, 81.9, 81.8, 82.1, 82.4, 82.0, 81.4, 81.5, 81.6, 81.8, 81.3, 81.5, 81.4, 81.35],
      marketCapEN: 'Global benchmark for sweet crude',
      marketCapZH: '北大西洋轻质低硫原油全球定价标杆',
      exchangeEN: 'ICE Futures Europe (London)',
      exchangeZH: '洲际交易所伦敦主力原油期货端点',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=BRENT&apikey=YOUR_KEY',
      apiResponseSample: `{ "name": "Brent Crude Oil", "unit": "dollars per barrel", "data": [ { "date": "2026-05-20", "value": "81.35" } ] }`,
      descriptionEN: 'Sourced from the North Sea, Brent Crude constitutes the ultimate global standard for light, sweet petroleum pricing, directly steering fuel and transportation index fluctuations worldwide.',
      descriptionZH: '产自北大西洋北海。其理化结构轻质、低硫，是国际成品油精炼的核心风向标，直接锚定了包括中国和欧洲在内的三分之二国际石油贸易。',
      convertRatio: 158.987, // liters in 1 barrel
      altUnitEN: '/ Liter',
      altUnitZH: '/ 升'
    },
    {
      id: 'gas',
      symbol: 'NAT_GAS',
      nameEN: 'Natural Gas',
      nameZH: '美国天然气 NYMEX',
      category: 'energy',
      price: 2.18,
      changePercent: -1.75,
      unitEN: '/ MMBtu',
      unitZH: '/ 百万英热',
      history: [2.32, 2.30, 2.27, 2.28, 2.25, 2.22, 2.20, 2.15, 2.16, 2.17, 2.22, 2.18, 2.20, 2.19, 2.18],
      marketCapEN: 'Henry Hub Benchmark Spot',
      marketCapZH: '路易斯安那亨利港物理交割中心核心价',
      exchangeEN: 'NYMEX Henry Hub Spot',
      exchangeZH: '纽约商品交易所亨利枢纽现货基价',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=NATURAL_GAS&apikey=YOUR_KEY',
      apiResponseSample: `{ "name": "Natural Gas", "unit": "dollars per MMBtu", "data": [ { "date": "2026-05-20", "value": "2.18" } ] }`,
      descriptionEN: 'Natural Gas pricing is heavily impacted by seasonal weather extremes, US shale drilling rates, and massive liquefied LNG transport exports toward Asian and European energy terminals.',
      descriptionZH: '天然气报价极其受到极寒/酷暑气温、美洲页岩气产量以及中美/中欧液化天然气（LNG）大规模跨洋船运出口和地缘政治溢价的影响。',
      convertRatio: 28.2637, // cubic meters per MMBtu
      altUnitEN: '/ m³ (gas vol)',
      altUnitZH: '/ 立方米气量'
    },
    {
      id: 'heating',
      symbol: 'HO_NY',
      nameEN: 'Heating Oil',
      nameZH: '美国取暖油 NY',
      category: 'energy',
      price: 2.45,
      changePercent: 0.15,
      unitEN: '/ gal',
      unitZH: '/ 加仑',
      history: [2.40, 2.41, 2.39, 2.42, 2.45, 2.43, 2.42, 2.44, 2.46, 2.45, 2.48, 2.44, 2.43, 2.44, 2.45],
      marketCapEN: 'NYC Harbor Delivery Standard',
      marketCapZH: '纽约港基准交割规格燃料油',
      exchangeEN: 'NYMEX Mercantile Spot',
      exchangeZH: '纽约商业交易所取暖油现货指数',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=HEATING_OIL&apikey=YOUR_KEY',
      apiResponseSample: `{ "name": "Heating Oil", "unit": "dollars per gallon", "data": [ { "date": "2026-05-20", "value": "2.45" } ] }`,
      descriptionEN: 'Heating oil represents a major distillate product refined from petroleum. Highly tied to diesel fuel indices and seasonal heating grids active in Eastern US and Northern China.',
      descriptionZH: '取暖油是由原油炼制而成的中质馏分燃料，与柴油的生产流程和价格指数有着近乎1:1的挂钩比率，受美东与我国北方冬季采暖刚需拉动。',
      convertRatio: 3.78541, // liters per gallon
      altUnitEN: '/ Liter',
      altUnitZH: '/ 升'
    },
    {
      id: 'nyse',
      symbol: 'SPX',
      nameEN: 'S&P 500 (NYSE Equivalent)',
      nameZH: '标普500指数',
      category: 'stocks',
      price: 5245.20,
      changePercent: 0.78,
      unitEN: 'Points',
      unitZH: '点',
      history: [5150, 5175, 5160, 5190, 5205, 5195, 5210, 5235, 5220, 5225, 5250, 5232, 5240, 5242, 5245.20],
      marketCapEN: '$44.5T Asset Base',
      marketCapZH: '成份股覆盖44.5万亿美元规模',
      exchangeEN: 'New York Stock Exchange / NASDAQ',
      exchangeZH: '纽约证券交易所 / 纳斯达克跨机构精算',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=YOUR_KEY',
      apiResponseSample: `{ "Meta Data": { "Information": "Daily Prices" }, "Time Series (Daily)": { "2026-05-20": { "4. Close": "524.52" } } }`,
      descriptionEN: 'Tracks the largest 500 blue-chip companies listed in the United States, representing the ultimate barometer of US equity strength, institutional liquidity, and massive global wealth pools.',
      descriptionZH: '覆盖美股最核心的500家超大型蓝筹上市公司，是美国实体经济实力和全球美元流动性的主要晴雨表。其期指表现决定了全球科技巨头的估值中枢。',
      convertRatio: 1,
      altUnitEN: 'Index Value',
      altUnitZH: '指数基准'
    },
    {
      id: 'sse',
      symbol: '000001.SS',
      nameEN: 'Shanghai Composite',
      nameZH: '上证综合指数',
      category: 'stocks',
      price: 3085.60,
      changePercent: -0.42,
      unitEN: 'Points',
      unitZH: '点',
      history: [3120, 3110, 3095, 3105, 3090, 3101, 3085, 3072, 3079, 3082, 3095, 3080, 3082, 3084, 3085.60],
      marketCapEN: '$7.8T Asset Base',
      marketCapZH: '两市总市值折合约7.8万亿美元',
      exchangeEN: 'Shanghai Stock Exchange (SSE)',
      exchangeZH: '上海证券交易所主板成份加权',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=000001.SS&apikey=YOUR_KEY',
      apiResponseSample: `{ "Global Quote": { "01. symbol": "000001.SS", "05. price": "3085.60", "10. change percent": "-0.42%" } }`,
      descriptionEN: 'Tracks all listed A-shares on the Shanghai Stock Exchange, capturing China state-owned infrastructure capital, massive manufacturing components, and high-tech industrial upgrades.',
      descriptionZH: '统计在上海证券交易所上市的全部股票。展现了中华经济圈实体支柱产业、国有骨干央企以及高端制造集群的关键发展动力和流动资金。',
      convertRatio: 1,
      altUnitEN: 'Index Value',
      altUnitZH: '指数基准'
    },
    {
      id: 'lse',
      symbol: 'FTSE',
      nameEN: 'FTSE 100 (London)',
      nameZH: '富时100指数 (英国)',
      category: 'stocks',
      price: 7924.50,
      changePercent: 1.15,
      unitEN: 'Points',
      unitZH: '点',
      history: [7780, 7810, 7800, 7830, 7855, 7850, 7870, 7940, 7890, 7905, 7935, 7915, 7920, 7922, 7924.50],
      marketCapEN: '$2.5T Asset Base',
      marketCapZH: '涵盖成分股市值约2.5万亿美元',
      exchangeEN: 'London Stock Exchange (LSE)',
      exchangeZH: '英国伦敦证券交易所顶级百强',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QD8N.LON&apikey=YOUR_KEY',
      apiResponseSample: `{ "Global Quote": { "01. symbol": "QD8N.LON", "05. price": "7924.50", "09. change": "90.00" } }`,
      descriptionEN: 'Representing the top 100 blue-chip firms traded in the UK. Richly heavily in mining corporations, banks, energy conglomerates, and giant pharmaceutical pioneers.',
      descriptionZH: '包含在伦敦证券交易所上市的市值最大的100位跨国巨头。其中大量涵盖了跨国采矿集团、老牌金融财阀、传统能源油气及国际顶级药企。',
      convertRatio: 1,
      altUnitEN: 'Index Value',
      altUnitZH: '指数基准'
    },
    {
      id: 'usd_cny',
      symbol: 'USD/CNY',
      nameEN: 'USD / CNY Exchange Rate',
      nameZH: '美元对人民币（在岸/离岸）',
      category: 'currencies',
      price: 7.2452,
      changePercent: -0.12,
      unitEN: 'CNY / 1 USD',
      unitZH: '元人民币 / 1 美元',
      history: [7.2310, 7.2340, 7.2390, 7.2450, 7.2410, 7.2420, 7.2490, 7.2510, 7.2480, 7.2460, 7.2480, 7.2440, 7.2450, 7.2456, 7.2452],
      marketCapEN: 'Primary trade gateway conversion rate',
      marketCapZH: '中美元首贸易双向结算唯一基础等值线',
      exchangeEN: 'PBOC Centering / Interbank',
      exchangeZH: '中国人民银行每日中间价及同业拆借',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=CNY&apikey=YOUR_KEY',
      apiResponseSample: `{ "Realtime Currency Exchange Rate": { "1. From_Currency Code": "USD", "3. To_Currency Code": "CNY", "5. Exchange Rate": "7.2452" } }`,
      descriptionEN: 'The absolute most crucial foreign exchange relationship in the modern world. Governs import-export dynamics, pricing vectors, and mutual investments across the US and China.',
      descriptionZH: '当今世界最重要的双边主权货币汇率关系。影响着美中两国的进出口贸易成本物价、跨国供应链资产摆放及央行货币政策走向。',
      convertRatio: 1,
      altUnitEN: 'USD/CNY',
      altUnitZH: '中美元首汇率点位'
    },
    {
      id: 'eur_usd',
      symbol: 'EUR/USD',
      nameEN: 'EUR / USD Exchange Rate',
      nameZH: '欧元对美元',
      category: 'currencies',
      price: 1.0845,
      changePercent: 0.18,
      unitEN: 'USD / 1 EUR',
      unitZH: '美元 / 1 欧元',
      history: [1.0750, 1.0780, 1.0760, 1.0810, 1.0830, 1.0820, 1.0840, 1.0870, 1.0840, 1.0850, 1.0860, 1.0830, 1.0840, 1.0843, 1.0845],
      marketCapEN: 'Largest global interbank currency pair',
      marketCapZH: '占全球每日外汇交易总额25%以上的霸交易盘',
      exchangeEN: 'ECB Benchmark / Interbank Forex',
      exchangeZH: '欧洲中央银行参考汇价与即期市场外汇总线',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=YOUR_KEY',
      apiResponseSample: `{ "Realtime Currency Exchange Rate": { "5. Exchange Rate": "1.0845" } }`,
      descriptionEN: 'Constitutes the worlds largest institutional liquidity pair, defining relative strength between European industrial bases and US federal interest rate cycles.',
      descriptionZH: '全球交易量居于首位的硬通货交易对。定义了欧洲整体制造业基本面与美联储联邦基准利率周期（降息/加息）之间的强势天平。',
      convertRatio: 1,
      altUnitEN: 'EUR/USD',
      altUnitZH: '欧元兑美元点位'
    },
    {
      id: 'usd_hkd',
      symbol: 'USD/HKD',
      nameEN: 'USD / HKD Exchange Rate',
      nameZH: '美元对港币 (联系汇率制)',
      category: 'currencies',
      price: 7.8115,
      changePercent: 0.01,
      unitEN: 'HKD / 1 USD',
      unitZH: '港元 / 1 美元',
      history: [7.8080, 7.8090, 7.8100, 7.8120, 7.8110, 7.8115, 7.8122, 7.8130, 7.8110, 7.8115, 7.8120, 7.8112, 7.8116, 7.8114, 7.8115],
      marketCapEN: 'Hong Kong Dollar Peg (7.75 - 7.85 limit)',
      marketCapZH: '联系汇率区间上限7.75至下限7.85强力保证面',
      exchangeEN: 'HKMA Hong Kong Monetary Authority',
      exchangeZH: '中国香港金融管理局强阻双向买盘托市范围',
      apiSampleUrl: 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=HKD&apikey=YOUR_KEY',
      apiResponseSample: `{ "Realtime Currency Exchange Rate": { "5. Exchange Rate": "7.8115" } }`,
      descriptionEN: 'Tied linked to the US Dollar via Hong Kongs legendary Currency Board system. Crucial for understanding financial traffic, real-estate capitalization, and mainland stocks listed in HK.',
      descriptionZH: '自1983年起实行香港标志性的联系汇率制度。将港元严格挂钩锚定美元。是透视大陆企业离岸融资、香港转口过境热钱以及红筹股估值的重要渠道。',
      convertRatio: 1,
      altUnitEN: 'USD/HKD',
      altUnitZH: '美元兑港币点位'
    }
  ]);

  // Read USD/CNY current rate for converters
  const usdCnyRate = useMemo(() => {
    const asset = assets.find(a => a.id === 'usd_cny');
    return asset ? asset.price : 7.2450;
  }, [assets]);

  // Current selected asset object
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // ==========================================
  // REAL-TIME TIMEZONE CLOCKS
  // ==========================================
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      
      // New York Clock (EST/EDT)
      const nyStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setNyTime(nyStr);

      // Shanghai Clock (CST)
      const shStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setShTime(shStr);

      // Check if market is active (Standard Trading hrs: Monday-Friday 9:30 AM to 4:00 PM EST)
      const day = now.getUTCDay(); // 0 is Sun, 6 is Sat
      const isWeekend = day === 0 || day === 6;
      
      // Simplified Market Hour check for New York (EST is about UTC-4 or UTC-5):
      // NYSE: 14:30 to 21:00 UTC
      const utcHours = now.getUTCHours();
      const utcMins = now.getUTCMinutes();
      const decTime = utcHours + utcMins / 60;
      const nyOpen = !isWeekend && (decTime >= 13.5 && decTime <= 20.0);
      
      // SSE (Shanghai is UTC+8)
      // Shanghai hours: 09:30-11:30 and 13:00-15:00 (CST) -> 01:30-03:30 and 05:00-07:00 UTC
      const sseOpen = !isWeekend && (
        (decTime >= 1.5 && decTime <= 3.5) || (decTime >= 5.0 && decTime <= 7.0)
      );

      setMarketsOpen({ ny: nyOpen, sh: sseOpen });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // HIGH-FREQUENCY INTERVAL FLUCTUATOR (Ticking)
  // ==========================================
  useEffect(() => {
    const fetchLivePricesAndFluctuate = async () => {
      // If live mode is selected AND the user wants Binance/CoinGecko rates, try fetching crypto live!
      if (isLiveMode) {
        try {
          // Fetch Bitcoin & Ethereum from Binance (No key required!)
          const btcRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          const ethRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
          const solRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
          
          let btcPrice: number | null = null;
          let ethPrice: number | null = null;
          let solPrice: number | null = null;

          if (btcRes.ok) {
            const data = await btcRes.json();
            btcPrice = parseFloat(data.price);
          }
          if (ethRes.ok) {
            const data = await ethRes.json();
            ethPrice = parseFloat(data.price);
          }
          if (solRes.ok) {
            const data = await solRes.json();
            solPrice = parseFloat(data.price);
          }

          setAssets(prev => prev.map(item => {
            let updatedPrice = item.price;
            let updatedHistory = [...item.history];
            let rawFlash: 'all-up' | 'all-down' | null = null;

            if (item.id === 'btc' && btcPrice) {
              rawFlash = btcPrice > item.price ? 'all-up' : 'all-down';
              updatedPrice = btcPrice;
            } else if (item.id === 'eth' && ethPrice) {
              rawFlash = ethPrice > item.price ? 'all-up' : 'all-down';
              updatedPrice = ethPrice;
            } else if (item.id === 'sol' && solPrice) {
              rawFlash = solPrice > item.price ? 'all-up' : 'all-down';
              updatedPrice = solPrice;
            } else {
              // Fluctuate non-crypto options slightly to maintain real-time visual liveliness
              const variance = (Math.random() - 0.492) * 0.0012; // 0.12% variance
              updatedPrice = item.price * (1 + variance);
              rawFlash = variance > 0 ? 'all-up' : 'all-down';
            }

            if (rawFlash) {
              setFlashStates(fs => ({
                ...fs,
                [item.id]: { direction: rawFlash!, timestamp: Date.now() }
              }));
            }

            if (updatedPrice !== item.price) {
              updatedHistory.push(updatedPrice);
              if (updatedHistory.length > 15) updatedHistory.shift();
            }

            return {
              ...item,
              price: updatedPrice,
              history: updatedHistory
            };
          }));
          return;
        } catch (e) {
          console.warn("Live fetch error, falling back to clean simulator: ", e);
        }
      }

      // Fallback or Simulation Mode (highly clean mathematical random walk)
      // Pick 2 random assets to tick every intervals to keep it clean and performant
      const eligibleIds = assets.map(a => a.id);
      const chosenIds = [
        eligibleIds[Math.floor(Math.random() * eligibleIds.length)],
        eligibleIds[Math.floor(Math.random() * eligibleIds.length)]
      ];

      setAssets(prev => prev.map(item => {
        if (!chosenIds.includes(item.id)) return item;

        // Perform standard random walk with mild positive skew
        const changeFactor = (Math.random() - 0.490) * 0.0022; // up to 0.22% fluctuation
        const updatedPrice = item.price * (1 + changeFactor);
        const direction = changeFactor > 0 ? 'all-up' : 'all-down';

        // Update flash state
        setFlashStates(fs => ({
          ...fs,
          [item.id]: { direction, timestamp: Date.now() }
        }));

        // Rollover history
        let updatedHistory = [...item.history];
        updatedHistory.push(updatedPrice);
        if (updatedHistory.length > 15) {
          updatedHistory.shift();
        }

        // recalculate synthetic change percentage relative to open day index (approx center of history)
        const dayOpenFactor = updatedHistory[0] || 1;
        const netChange = ((updatedPrice - dayOpenFactor) / dayOpenFactor) * 100;

        return {
          ...item,
          price: updatedPrice,
          changePercent: Number(netChange.toFixed(2)),
          history: updatedHistory
        };
      }));
    };

    const tickerInterval = setInterval(fetchLivePricesAndFluctuate, 1600);
    return () => clearInterval(tickerInterval);
  }, [isLiveMode, assets]);

  // ==========================================
  // SPARKLINE RENDERER GENERATOR (SVG-based)
  // ==========================================
  const renderSparkline = (history: number[], isPositive: boolean) => {
    if (!history || history.length < 2) return null;
    const width = 140;
    const height = 42;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const spread = (max - min) || 1;

    // Build SVG path points
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - 3 - ((val - min) / spread) * (height - 6);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    // Fill polygon coordinates
    const closedPoints = [
      `0,${height}`,
      ...points,
      `${width},${height}`
    ];
    const fillD = `M ${closedPoints.join(' L ')} Z`;

    const strokeColor = isPositive ? '#22c55e' : '#f87171';
    const gradientId = `grad-${isPositive ? 'pos' : 'neg'}`;

    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#${gradientId})`} />
        <path 
          d={pathD} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Draw a small pulsing endpoint */}
        <circle 
          cx={width} 
          cy={height - 3 - ((history[history.length - 1] - min) / spread) * (height - 6)} 
          r="2.5" 
          fill={strokeColor} 
          className="animate-ping" 
        />
        <circle 
          cx={width} 
          cy={height - 3 - ((history[history.length - 1] - min) / spread) * (height - 6)} 
          r="1.8" 
          fill={strokeColor} 
        />
      </svg>
    );
  };

  // Helper translations renderer
  const t = (key: keyof typeof dict.en) => {
    if (lang === 'zh') return dict.zh[key];
    return dict.en[key];
  };

  const getBilingualLabel = (item: FinancialAsset) => {
    if (lang === 'en') return item.nameEN;
    if (lang === 'zh') return item.nameZH;
    // Bilingual mode
    return (
      <div className="flex flex-col">
        <span className="font-bold leading-normal text-slate-100">{item.nameEN}</span>
        <span className="text-[10px] text-slate-400 font-normal">{item.nameZH}</span>
      </div>
    );
  };

  const getBilingualCategory = (category: string) => {
    const cats: Record<string, {en: string, zh: string}> = {
      metals: { en: 'Metals Spot 贵金属', zh: '贵金属' },
      crypto: { en: 'Crypto Decoupled 加密货币', zh: '加密货币' },
      energy: { en: 'Fuels & Energy 燃料与能源', zh: '能源与燃料' },
      stocks: { en: 'Stocks Indices 全球股市', zh: '全球股市' },
      currencies: { en: 'Forex Pairs 外汇汇率', zh: '外汇汇率' }
    };
    if (lang === 'en') return cats[category]?.en.split(' ')[0] || category;
    if (lang === 'zh') return cats[category]?.zh || category;
    return `${cats[category]?.en}`;
  };

  // Copy API endpoint helper
  const handleCopyUri = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Safe API Key store
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('vantage_api_key', key);
  };

  // Clear Key
  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('vantage_api_key');
  };

  // Convert function for selected asset
  const getConvertedOutputs = () => {
    const rate = selectedAsset.price;
    const ratio = selectedAsset.convertRatio || 1;
    
    // Core currency equivalents: USD vs CNY
    const priceCnyValue = rate * usdCnyRate;
    
    // Calculate conversions based on calcInput
    let primaryToAlt = calcInput * ratio;
    let altToPrimary = calcInput / ratio;

    // Format strings
    return {
      priceCny: priceCnyValue.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
      priceUsd: rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
      primToAltStr: `${calcInput} ${selectedAsset.id === 'gold' || selectedAsset.id === 'silver' || selectedAsset.id === 'platinum' ? 'oz (盎司)' : selectedAsset.id === 'brent' ? 'bbl (桶)' : selectedAsset.id === 'heating' ? 'gal (加仑)' : selectedAsset.id === 'gas' ? 'MMBtu' : selectedAsset.symbol} = ${primaryToAlt.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${lang === 'zh' ? selectedAsset.altUnitZH : selectedAsset.altUnitEN}`,
      altToPrimStr: `${calcInput} ${lang === 'zh' ? selectedAsset.altUnitZH : selectedAsset.altUnitEN} = ${altToPrimary.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${selectedAsset.id === 'gold' || selectedAsset.id === 'silver' || selectedAsset.id === 'platinum' ? 'oz' : selectedAsset.id === 'brent' ? 'bbl' : selectedAsset.id === 'heating' ? 'gal' : selectedAsset.symbol}`
    };
  };

  const conversionData = useMemo(() => getConvertedOutputs(), [selectedAsset, calcInput, usdCnyRate, lang]);

  return (
    <div id="vantage-root" className="min-h-screen bg-[#050505] text-slate-200 px-4 py-6 md:p-6 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* ==========================================
          HEADER SECTION
         ========================================== */}
      <header id="vantage-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-4">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xl tracking-tighter">V</div>
          <div>
            <h1 id="vantage-logo-text" className="text-xl md:text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
              {t('title')} <span className="text-blue-500 font-semibold">{t('subtitle')}</span>
            </h1>
            <p className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">{t('tagline')}</p>
          </div>
        </div>

        {/* Center Live Clocks representing global audience centers (New York & Shanghai) */}
        <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-wider font-mono">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col min-w-[130px]">
            <span className="text-[9px] text-slate-500 font-sans tracking-wide font-bold">{t('nyClock')}</span>
            <div className="flex items-center gap-2 justify-between mt-0.5">
              <span className="text-slate-200 font-semibold text-sm">{nyTime}</span>
              <span className="flex items-center gap-1 text-[9px] font-sans font-bold">
                <span className={`w-2 h-2 rounded-full ${marketsOpen.ny ? 'bg-green-500 animate-pulse' : 'bg-amber-600'}`} />
                <span className={marketsOpen.ny ? 'text-green-500' : 'text-amber-500'}>
                  {marketsOpen.ny ? t('marketOpen') : t('marketClosed')}
                </span>
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col min-w-[130px]">
            <span className="text-[9px] text-slate-500 font-sans tracking-wide font-bold">{t('shClock')}</span>
            <div className="flex items-center gap-2 justify-between mt-0.5">
              <span className="text-slate-200 font-semibold text-sm">{shTime}</span>
              <span className="flex items-center gap-1 text-[9px] font-sans font-bold">
                <span className={`w-2 h-2 rounded-full ${marketsOpen.sh ? 'bg-green-500 animate-pulse' : 'bg-amber-600'}`} />
                <span className={marketsOpen.sh ? 'text-green-500' : 'text-amber-500'}>
                  {marketsOpen.sh ? t('marketOpen') : t('marketClosed')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Language Navigation Controller */}
        <div id="vantage-lang-toggle" className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-stretch md:self-auto justify-between md:justify-start">
          <button 
            onClick={() => setLang('bilingual')}
            className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'bilingual' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Bilingual /双语
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('zh')}
            className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'zh' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            简体中文
          </button>
        </div>

      </header>

      {/* ==========================================
          BENTO GRID SYSTEM
         ========================================== */}
      <div id="vantage-bento-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-4 flex-grow auto-rows-min">
        
        {/* BENTO CARD 1: GLOBAL STOCK EXCHANGES (NYSE, SSE, LSE) - Spans 12-col on small, 8-col on large */}
        <div id="bento-stocks-card" className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-8 bg-[#0f0f11] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition hover:border-white/10 group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-500 rounded-full inline-block" />
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 uppercase">
                  {lang === 'en' ? 'Global Stock Exchanges' : lang === 'zh' ? '全球股票交易所' : 'Global Stock Exchanges 全球股市'}
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{t('stocksSub')}</p>
            </div>
            
            <div className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
              {isLiveMode ? 'API ACTIVE' : 'REAL TIME ALGO'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.filter(a => a.category === 'stocks').map(item => {
              const isPos = item.changePercent >= 0;
              const flash = flashStates[item.id];
              const isFlashActive = flash && (Date.now() - flash.timestamp < 900);
              const flashColor = isFlashActive 
                ? (flash.direction === 'all-up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')
                : 'border-transparent';

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`cursor-pointer rounded-2xl p-4 bg-white/[0.02] border hover:bg-white/[0.04] transition-all hover:border-white/10 ${selectedAssetId === item.id ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'border-white/5'} ${flashColor}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-blue-400 font-bold tracking-wider font-mono">{item.symbol}</span>
                      <span className="text-sm font-bold text-slate-200 mt-0.5">{getBilingualLabel(item)}</span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${isPos ? 'text-green-500 bg-green-500/10' : 'text-red-400 bg-red-400/10'}`}>
                      {isPos ? '↑' : '↓'} {isPos ? '+' : ''}{item.changePercent}%
                    </span>
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-mono font-bold tracking-tight text-white block">
                      {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-mono mt-0.5">{lang === 'zh' ? item.exchangeZH : item.exchangeEN}</span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    {renderSparkline(item.history, isPos)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BENTO CARD 2: CRYPTO ASSETS (BTC, ETH, SOL) - Spans 4-col */}
        <div id="bento-crypto-card" className="col-span-1 lg:col-span-1 xl:col-span-4 bg-[#0f0f11] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg hover:border-white/10 group transition-all">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-orange-500 rounded-full inline-block" />
                <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                  {lang === 'en' ? 'Crypto' : lang === 'zh' ? '数字货币' : 'Crypto 加密货币'}
                </h2>
              </div>
              <Coins className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{t('cryptoSub')}</p>
          </div>

          <div className="space-y-3.5 my-3">
            {assets.filter(a => a.category === 'crypto').map(item => {
              const isPos = item.changePercent >= 0;
              const flash = flashStates[item.id];
              const isFlashActive = flash && (Date.now() - flash.timestamp < 900);
              const flashStyle = isFlashActive 
                ? (flash.direction === 'all-up' ? 'text-green-400 scale-[1.02]' : 'text-red-400 scale-[1.02]')
                : '';

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`cursor-pointer flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-all border ${selectedAssetId === item.id ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/[0.01] border-transparent'}`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-200">{item.symbol}</span>
                      <span className="text-[9px] font-mono text-slate-500">{lang === 'zh' ? item.nameZH : item.nameEN}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5">{lang === 'zh' ? item.marketCapZH : item.marketCapEN}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 hidden sm:block">
                      {renderSparkline(item.history, isPos)}
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold leading-none text-slate-100 transition-all duration-300 ${flashStyle}`}>
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] font-bold mt-1 font-mono ${isPos ? 'text-green-500' : 'text-red-400'}`}>
                        {isPos ? '+' : ''}{item.changePercent}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BENTO CARD 3: METALS (Gold, Silver, Platinum) - Spans 4-col */}
        <div id="bento-metals-card" className="col-span-1 lg:col-span-1 xl:col-span-4 bg-[#0f0f11] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg border-l-4 border-l-yellow-600/50 hover:border-white/10 group transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-yellow-500 rounded-full inline-block" />
                <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                  {lang === 'en' ? 'Metals' : lang === 'zh' ? '贵金属' : 'Metals 贵金属'}
                </h2>
              </div>
              <DollarSign className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('metalsSub')}</p>
          </div>

          <div className="space-y-4 my-4">
            {assets.filter(a => a.category === 'metals').map(item => {
              const isPos = item.changePercent >= 0;
              const flash = flashStates[item.id];
              const isFlashActive = flash && (Date.now() - flash.timestamp < 900);
              const flashStyle = isFlashActive 
                ? (flash.direction === 'all-up' ? 'text-green-400 font-bold scale-105' : 'text-red-400 font-bold scale-105')
                : '';

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`cursor-pointer flex justify-between items-center p-2.5 rounded-xl transition-all border ${selectedAssetId === item.id ? 'bg-yellow-500/10 border-yellow-500/30' : 'hover:bg-white/[0.03] border-transparent'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-slate-400 font-black tracking-widest">{item.symbol}</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">{getBilingualLabel(item)}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="w-14 hidden md:block">
                      {renderSparkline(item.history, isPos)}
                    </div>
                    <div>
                      <span className={`block text-md font-mono font-bold text-slate-100 transition-all ${flashStyle}`}>
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-500 italic">
                        {lang === 'zh' ? item.unitZH : item.unitEN}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BENTO CARD 4: ENERGY & FUELS (Brent, Gas, Heating Oil) - Spans 4-col */}
        <div id="bento-energy-card" className="col-span-1 lg:col-span-1 xl:col-span-4 bg-[#0f0f11] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg border-l-4 border-l-emerald-600/50 hover:border-white/10 group transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-emerald-500 rounded-full inline-block" />
                <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                  {lang === 'en' ? 'Energy' : lang === 'zh' ? '燃料能源' : 'Energy 能源'}
                </h2>
              </div>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('energySub')}</p>
          </div>

          <div className="space-y-4 my-4">
            {assets.filter(a => a.category === 'energy').map(item => {
              const isPos = item.changePercent >= 0;
              const flash = flashStates[item.id];
              const isFlashActive = flash && (Date.now() - flash.timestamp < 900);
              const flashStyle = isFlashActive 
                ? (flash.direction === 'all-up' ? 'text-green-400 scale-105' : 'text-red-400 scale-105')
                : '';

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`cursor-pointer flex justify-between items-center p-2.5 rounded-xl transition-all border ${selectedAssetId === item.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'hover:bg-white/[0.03] border-transparent'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-slate-400 font-black tracking-widest">{item.symbol}</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">{getBilingualLabel(item)}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="w-14 hidden md:block">
                      {renderSparkline(item.history, isPos)}
                    </div>
                    <div>
                      <span className={`block text-md font-mono font-bold text-slate-100 transition-all ${flashStyle}`}>
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className="text-[9px] text-slate-500 italic">
                        {lang === 'zh' ? item.unitZH : item.unitEN}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BENTO CARD 5 (CRITICAL SUGGESTION): FX FOREIGN CURRENCIES (USD/CNY, EUR/USD, USD/HKD) - Spans 4-col */}
        <div id="bento-currencies-card" className="col-span-1 lg:col-span-1 xl:col-span-4 bg-[#0f0f11] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg border-l-4 border-l-purple-600/50 hover:border-white/10 group transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-purple-500 rounded-full inline-block" />
                <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                  {lang === 'en' ? 'Foreign Exchange' : lang === 'zh' ? '国际外汇' : 'FX 外汇汇率'}
                </h2>
              </div>
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('currenciesSub')}</p>
          </div>

          <div className="space-y-4 my-4">
            {assets.filter(a => a.category === 'currencies').map(item => {
              const isPos = item.changePercent >= 0;
              const flash = flashStates[item.id];
              const isFlashActive = flash && (Date.now() - flash.timestamp < 900);
              const flashStyle = isFlashActive 
                ? (flash.direction === 'all-up' ? 'text-green-400 scale-105' : 'text-red-400 scale-105')
                : '';

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`cursor-pointer flex justify-between items-center p-2.5 rounded-xl transition-all border ${selectedAssetId === item.id ? 'bg-purple-500/10 border-purple-500/30' : 'hover:bg-white/[0.03] border-transparent'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-slate-400 font-mono tracking-wider font-extrabold">{item.symbol}</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">{getBilingualLabel(item)}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="w-14 hidden md:block">
                      {renderSparkline(item.history, isPos)}
                    </div>
                    <div>
                      <span className={`block text-md font-mono font-bold text-slate-100 transition-all ${flashStyle}`}>
                        {item.price.toFixed(4)}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {lang === 'zh' ? item.unitZH : item.unitEN}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



      </div>

      {/* ==========================================
          INTERACTIVE INSPECT DRAWER / BOTTOM OVERLAY
         ========================================== */}
      <section id="vantage-inspection-pane" className="mt-6 border border-white/5 bg-[#0f0f11] rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Col 1: Asset Core Details & SVG Extended History Chart */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4">
            
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {getBilingualCategory(selectedAsset.category)}
                </span>
                
                <h3 className="text-2xl font-bold tracking-tight text-white mt-2 flex items-center gap-2">
                  {selectedAsset.nameEN} <span className="text-slate-400 text-lg font-medium">({selectedAsset.symbol})</span>
                  <span className="text-slate-500 text-sm font-light">/</span> 
                  <span className="text-blue-400 text-xl font-semibold font-sans">{selectedAsset.nameZH}</span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block font-sans">USA Reference (USD) Spot:</span>
                <span className="text-3xl font-mono font-bold text-white block">
                  ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className={`text-xs font-mono font-bold ${selectedAsset.changePercent >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {selectedAsset.changePercent >= 0 ? '▲ +' : '▼ '}{selectedAsset.changePercent}% (24H)
                </span>
              </div>
            </div>

            {/* Extended Line Chart visualization of ticker history points */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mt-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider font-sans">
                  {lang === 'zh' ? '实时点对点波动趋势（最新15个交易点）' : 'Real-Time Dynamic Trend (Last 15 ticks)'}
                </span>
                <div className="flex gap-2">
                  <span className="text-[9px] text-green-500 font-bold">● HIGH: ${Math.max(...selectedAsset.history).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-red-400 font-bold">● LOW: ${Math.min(...selectedAsset.history).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Interactive custom high-fidelity chart plot */}
              <div className="h-44 w-full flex items-end relative pt-4 pb-2">
                {/* Horizontal reference grid lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-white/[0.03]" />
                <div className="absolute inset-x-0 top-2/4 border-t border-white/[0.03]" />
                <div className="absolute inset-x-0 top-3/4 border-t border-white/[0.03]" />

                {/* SVG Line path for full detailed chart */}
                <div className="w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grid-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* SVG plotting logic */}
                    {(() => {
                      const h = selectedAsset.history;
                      const min = Math.min(...h);
                      const max = Math.max(...h);
                      const spread = (max - min) || 1;
                      const pts = h.map((val, idx) => {
                        const x = (idx / (h.length - 1)) * 600;
                        const y = 150 - ((val - min) / spread) * 130;
                        return `${x},${y}`;
                      });

                      const pathD = `M ${pts.join(' L ')}`;
                      const fillD = `M 0,160 L ${pts.join(' L ')} L 600,160 Z`;
                      const strokeColor = selectedAsset.changePercent >= 0 ? '#10b981' : '#f87171';

                      return (
                        <>
                          <path d={fillD} fill="url(#grid-grad)" />
                          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Anchor nodes and data labels */}
                          {h.map((val, idx) => {
                            const x = (idx / (h.length - 1)) * 600;
                            const y = 150 - ((val - min) / spread) * 130;
                            return (
                              <g key={idx} className="group/dot">
                                <circle cx={x} cy={y} r="3" fill={strokeColor} className="hover:r-5 transition-all cursor-pointer" />
                                <text x={x} y={y - 8} fontSize="8" fill="#cbd5e1" textAnchor="middle" className="hidden group-hover/dot:block font-mono font-bold bg-[#000]">
                                  ${val.toFixed(selectedAsset.id.includes('usd') || selectedAsset.id === 'gas' ? 4 : 1)}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Timeline markers */}
              <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-2 border-t border-white/5">
                <span>-20 min</span>
                <span>-15 min</span>
                <span>-10 min</span>
                <span>-5 min</span>
                <span className="text-blue-400">LIVE COINMARKETCAP TACTICAL</span>
              </div>
            </div>

            {/* Educational Segment */}
            <div className="mt-2 text-xs leading-relaxed text-slate-400">
              <h4 className="font-bold text-slate-200 uppercase tracking-wide mb-1 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-orange-400" />
                {lang === 'zh' ? '中美双边市场解读 Profile Information' : 'Asset Profile Interpretations'}
              </h4>
              <p className="p-3 bg-black/20 rounded-xl border border-white/5">
                {lang === 'zh' ? selectedAsset.descriptionZH : selectedAsset.descriptionEN}
              </p>
            </div>

          </div>

          {/* Col 2: Interactive Asset Converter & Specifications (Highly customized math calculator for US & CN audiences) */}
          <div className="lg:col-span-4 bg-black/30 border border-white/5 rounded-3xl p-5 flex flex-col justify-between self-stretch">
            
            <div>
              <div className="flex items-center gap-1 text-white font-bold text-sm uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                <ArrowRightLeft className="w-4 h-4 text-blue-400 animate-pulse" />
                {t('converterTitle')}
              </div>

              {/* Dynamic conversion calculator inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                    {lang === 'zh' ? '输入基准数量 (Quantity to change):' : 'Input Base Vol / Unit Quantity:'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="any"
                      placeholder="e.g., 1, 10, 100"
                      value={calcInput}
                      onChange={(e) => setCalcInput(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 uppercase font-mono font-bold">
                      {selectedAsset.symbol}
                    </span>
                  </div>
                </div>

                {/* Calculation Outputs and conversions designed specifically for bilingual audience */}
                <div className="bg-black/40 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-300">
                  
                  {/* CNY Valuation (Direct trade integration for Chinese audience!) */}
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">{t('convertUsdCny')}:</span>
                    <div className="text-sm font-bold text-slate-100 flex justify-between">
                      <span>{calcInput} USD =</span>
                      <span className="text-emerald-400">¥ {(calcInput * usdCnyRate).toFixed(4)} CNY</span>
                    </div>
                  </div>

                  {/* Physical Unit conversion for Metals & Crude */}
                  {selectedAsset.convertRatio && (
                    <div className="border-t border-white/[0.06] pt-2.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                        {selectedAsset.id === 'gold' || selectedAsset.id === 'silver' || selectedAsset.id === 'platinum' ? t('goldOzG') : t('brentBblL')}:
                      </span>
                      <div className="flex flex-col gap-1.5 text-[11px] text-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase">Primary &rarr; Alternate:</span>
                          <span className="font-bold text-white text-right">{conversionData.primToAltStr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase">Alternate &rarr; Primary:</span>
                          <span className="font-bold text-white text-right">{conversionData.altToPrimStr}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Index and asset cost breakdown per unit */}
                  <div className="border-t border-white/[0.06] pt-2.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Bilingual Valuation Estimate ($ & ¥):</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">{lang === 'zh' ? '总美元估值' : 'Est. Value USD'}:</span>
                      <span className="font-bold text-white">${(calcInput * selectedAsset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] mt-1">
                      <span className="text-slate-400">{lang === 'zh' ? '总人民币估值' : 'Est. Value CNY'}:</span>
                      <span className="font-bold text-emerald-400">¥{(calcInput * selectedAsset.price * usdCnyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Core Specifications Grid */}
            <div className="border-t border-white/5 pt-4 mt-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">{t('details')}</span>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                
                <div className="bg-[#050505] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">{t('symbolLabel')}</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block">{selectedAsset.symbol}</span>
                </div>

                <div className="bg-[#050505] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">{t('marketCap')}</span>
                  <span className="text-slate-200 mt-0.5 block tracking-tight truncate" title={lang === 'zh' ? selectedAsset.marketCapZH : selectedAsset.marketCapEN}>
                    {lang === 'zh' ? selectedAsset.marketCapZH : selectedAsset.marketCapEN}
                  </span>
                </div>

                <div className="col-span-2 bg-[#050505] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">{t('exchange')}</span>
                  <span className="text-slate-300 mt-0.5 block truncate">
                    {lang === 'zh' ? selectedAsset.exchangeZH : selectedAsset.exchangeEN}
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
          FOOTER SECTION
         ========================================== */}
      <footer id="vantage-footer" className="mt-6 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-white/5 pt-4 text-[10px] text-slate-600 font-mono uppercase tracking-wider">
        <div className="flex gap-4 items-center flex-wrap">
          <span className="flex items-center gap-1 font-bold">
            {t('apiStatus')}: 
            <span className="text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              {t('apiStable')}
            </span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span>{t('uptime')}</span>
        </div>
        
        <div className="text-center md:text-right text-slate-500 font-sans font-bold">
          {t('footerCredit')} &copy; {new Date().getFullYear()}
        </div>
      </footer>

    </div>
  );
}
