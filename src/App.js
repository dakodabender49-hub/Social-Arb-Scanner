import { useState, useCallback, useEffect } from "react";

// ─── PRODUCT → TICKER INTELLIGENCE ENGINE ────────────────────────────────────
// This is the core of the social arb strategy — mapping specific viral products
// to their exact publicly traded beneficiary stocks

const PRODUCT_TICKER_MAP = [
  // Food & Beverage — specific products
  { keywords: ["sweetgreen", "sweet green", "salad chain", "salad bowl"], tickers: ["CARM"], company: "Sweetgreen" },
  { keywords: ["celsius", "celsius drink", "celsius energy"], tickers: ["CELH"], company: "Celsius Holdings" },
  { keywords: ["monster energy", "monster drink"], tickers: ["MNST"], company: "Monster Beverage" },
  { keywords: ["dutch bros", "dutch brothers coffee"], tickers: ["BROS"], company: "Dutch Bros" },
  { keywords: ["chipotle", "chipotle burrito", "chipotle bowl"], tickers: ["CMG"], company: "Chipotle" },
  { keywords: ["starbucks", "starbucks drink", "starbucks order"], tickers: ["SBUX"], company: "Starbucks" },
  { keywords: ["olipop", "poppi", "prebiotic soda", "gut health soda"], tickers: ["CELH", "KO", "PEP"], company: "Prebiotic Soda" },
  { keywords: ["protein", "protein snack", "protein craze", "protein crave", "high protein", "protein trend"], tickers: ["SMPL", "POST", "AMZN"], company: "Simply Good Foods" },
  { keywords: ["chicken caesar", "caesar wrap", "caesar salad viral"], tickers: ["CARM", "CMG", "MCD"], company: "Sweetgreen/Fast Casual" },
  { keywords: ["stanley cup", "stanley tumbler", "stanley water bottle"], tickers: ["YETI", "NWL"], company: "Stanley/YETI" },
  { keywords: ["prime drink", "prime hydration", "logan paul drink"], tickers: ["KO", "PEP", "CELH"], company: "Prime/Hydration" },
  { keywords: ["athletic greens", "ag1", "greens powder"], tickers: ["HIMS", "AMZN", "NBEV"], company: "AG1/Supplements" },

  // Health & Pharma — specific treatments
  { keywords: ["ozempic", "wegovy", "semaglutide", "glp-1", "weight loss drug"], tickers: ["NVO", "LLY"], company: "Novo Nordisk/Eli Lilly" },
  { keywords: ["peptide", "peptides", "bpc-157", "tb-500", "body peptide"], tickers: ["HIMS", "AMGN", "NVO"], company: "Peptide/Biotech" },
  { keywords: ["hims", "hers", "hair loss treatment", "hair loss pill"], tickers: ["HIMS"], company: "Hims & Hers" },
  { keywords: ["mounjaro", "tirzepatide"], tickers: ["LLY"], company: "Eli Lilly" },
  { keywords: ["creatine", "creatine trend", "creatine monohydrate"], tickers: ["SMPL", "AMZN", "NUS"], company: "Supplement Brands" },
  { keywords: ["magnesium", "magnesium glycinate", "magnesium trend"], tickers: ["AMZN", "SMPL", "WMT"], company: "Supplement Retail" },
  { keywords: ["testosterone", "low t", "testosterone therapy"], tickers: ["HIMS", "ABBV"], company: "Hims/AbbVie" },
  { keywords: ["collagen", "collagen peptide", "collagen supplement"], tickers: ["HIMS", "AMZN", "ELF"], company: "Collagen/Beauty" },

  // Beauty & Skincare — specific brands
  { keywords: ["cerave", "cerave shortage", "cerave cleanser"], tickers: ["ULTA", "LOR.PA", "PG"], company: "L'Oreal/CeraVe" },
  { keywords: ["elf cosmetics", "elf beauty", "e.l.f"], tickers: ["ELF"], company: "e.l.f. Beauty" },
  { keywords: ["glow recipe", "korean skincare", "k-beauty", "kbeauty"], tickers: ["ELF", "ULTA", "COTY"], company: "K-Beauty" },
  { keywords: ["retinol", "retinol trend", "retinol cream"], tickers: ["ELF", "ULTA", "EL"], company: "Skincare/Beauty" },
  { keywords: ["rare beauty", "selena gomez makeup"], tickers: ["ULTA", "COTY"], company: "Rare Beauty" },
  { keywords: ["charlotte tilbury", "tilbury"], tickers: ["ULTA", "EL"], company: "Luxury Beauty" },
  { keywords: ["niacinamide", "hyaluronic acid", "skincare ingredient"], tickers: ["ELF", "ULTA"], company: "Skincare" },
  { keywords: ["tanning", "tanning drops", "self tanner", "sunless tan"], tickers: ["ELF", "ULTA", "COTY"], company: "Tanning/Beauty" },

  // Fashion & Footwear — specific products
  { keywords: ["birkenstock", "birks", "birkenstock sandal"], tickers: ["BIRK"], company: "Birkenstock" },
  { keywords: ["on running", "on cloud shoe", "on shoes"], tickers: ["ONON"], company: "On Running" },
  { keywords: ["hoka", "hoka shoe", "hoka running"], tickers: ["DECK"], company: "Deckers/Hoka" },
  { keywords: ["ugg", "ugg boots", "ugg slippers"], tickers: ["DECK"], company: "Deckers/UGG" },
  { keywords: ["lululemon", "lulu legging", "lululemon dupe"], tickers: ["LULU"], company: "Lululemon" },
  { keywords: ["stanley", "stanley cup", "water bottle trend"], tickers: ["YETI", "NWL"], company: "Stanley/YETI" },
  { keywords: ["new balance", "new balance 550", "nb 550"], tickers: ["NKE", "ONON"], company: "New Balance" },
  { keywords: ["needoh", "needoh toy", "sensory toy", "fidget toy"], tickers: ["GAIN", "HAS", "MAT"], company: "Noodoo/Toy" },
  { keywords: ["squishmallow", "squishmallow toy", "squish mallow"], tickers: ["HAS", "MAT", "GAIN"], company: "Squishmallow" },

  // Tech & Gadgets
  { keywords: ["vision pro", "apple vision", "spatial computing"], tickers: ["AAPL"], company: "Apple" },
  { keywords: ["chatgpt", "openai", "ai chatbot trend"], tickers: ["MSFT", "GOOGL", "NVDA"], company: "AI/OpenAI" },
  { keywords: ["nvidia", "gpu", "ai chip", "graphics card shortage"], tickers: ["NVDA"], company: "Nvidia" },
  { keywords: ["instagram", "instagram reels", "meta ai"], tickers: ["META"], company: "Meta" },
  { keywords: ["tiktok ban", "tiktok", "tiktok shop"], tickers: ["META", "SNAP", "GOOGL"], company: "TikTok/Meta" },
  { keywords: ["airpods", "airpods pro", "apple earbuds"], tickers: ["AAPL"], company: "Apple" },
  { keywords: ["humane ai pin", "rabbit r1", "ai wearable"], tickers: ["AAPL", "GOOGL", "MSFT"], company: "AI Wearables" },

  // Home & Lifestyle
  { keywords: ["home depot", "diy project", "home renovation viral"], tickers: ["HD", "LOW"], company: "Home Depot/Lowes" },
  { keywords: ["roomba", "robot vacuum", "robot mop"], tickers: ["IRBT", "AMZN"], company: "iRobot/Amazon" },
  { keywords: ["dyson", "dyson airwrap", "dyson vacuum"], tickers: ["AMZN", "ULTA"], company: "Dyson" },
  { keywords: ["traderjoe", "trader joe", "trader joe's"], tickers: ["WMT", "KR", "COST"], company: "Grocery/Retail" },
  { keywords: ["costco", "costco haul", "costco viral"], tickers: ["COST"], company: "Costco" },

  // Finance & Crypto
  { keywords: ["bitcoin", "btc", "crypto rally", "bitcoin etf"], tickers: ["COIN", "MSTR", "IBIT"], company: "Bitcoin/Crypto" },
  { keywords: ["robinhood", "options trading", "retail trading boom"], tickers: ["HOOD"], company: "Robinhood" },
  { keywords: ["gold", "gold price", "gold rush"], tickers: ["GLD", "NEM", "GOLD"], company: "Gold" },

  // Entertainment
  { keywords: ["pickleball", "pickleball trend", "pickleball court"], tickers: ["PTON", "NKE", "ONON"], company: "Pickleball/Fitness" },
  { keywords: ["golf", "golf trend", "topgolf"], tickers: ["MODG", "ACUSHNET", "NKE"], company: "Golf" },
  { keywords: ["taylor swift", "eras tour", "swiftie"], tickers: ["TICKETMASTER", "LYV", "SPOT"], company: "Live Nation/Spotify" },
  { keywords: ["nintendo", "nintendo switch", "mario"], tickers: ["NTDOY"], company: "Nintendo" },
];

function findTickers(text) {
  const lower = text.toLowerCase();
  for (const mapping of PRODUCT_TICKER_MAP) {
    for (const kw of mapping.keywords) {
      if (lower.includes(kw)) {
        return { tickers: mapping.tickers, company: mapping.company, matched: kw };
      }
    }
  }
  return null;
}

// ─── PLATFORMS & CONFIG ───────────────────────────────────────────────────────

const PLATFORMS = ["All", "Reddit", "News", "Hacker News", "Pinterest", "YouTube", "X/Twitter"];

const REDDIT_SUBS = [
  "skincareaddiction","makeupaddiction","haircare","beauty",
  "frugalmalefashion","femalefashionadvice","streetwear","Sneakers","thrift",
  "food","Cooking","EatCheapAndHealthy","nutrition","coffee","FoodPorn",
  "fitness","supplements","loseit","gainit","bodyweightfitness","running",
  "flipping","BuyItForLife","deals","Frugal","AmazonDeals",
  "gadgets","technology","Apple","Android",
  "personalfinance","investing","wallstreetbets","stocks",
  "LifeProTips","mildlyinteresting","todayilearned",
  "HomeImprovement","gardening","houseplants","DIY",
  "movies","television","gaming","books",
];

const PLATFORM_CONFIG = {
  "Reddit":       { color: "#ff4500", icon: "⬆", label: "REDDIT" },
  "News":         { color: "#4a9eff", icon: "◎", label: "NEWS" },
  "Hacker News":  { color: "#ff6600", icon: "Y", label: "HN" },
  "Pinterest":    { color: "#e60023", icon: "P", label: "PINTEREST" },
  "YouTube":      { color: "#ff0000", icon: "▶", label: "YOUTUBE" },
  "X/Twitter":    { color: "#e7e7e7", icon: "✕", label: "X" },
};

const FALLBACK_TICKER_MAP = {
  "Beauty/CPG": ["ELF","ULTA","PG"],
  "Healthcare": ["HIMS","CVS","AMZN"],
  "Supplements": ["HIMS","SMPL","AMZN"],
  "Food & Beverage": ["CELH","MNST","CMG"],
  "Footwear": ["BIRK","ONON","DECK"],
  "Fashion": ["LULU","NKE","VFC"],
  "Consumer Goods": ["YETI","AMZN","TGT"],
  "Tech": ["AAPL","META","NVDA"],
  "Finance": ["HOOD","COIN","SQ"],
  "Gaming": ["RBLX","EA","ATVI"],
  "Media": ["NFLX","SPOT","DIS"],
  "Home & Garden": ["HD","LOW","WSM"],
  "Pharma": ["NVO","LLY","HIMS"],
};

// ─── SCORING ──────────────────────────────────────────────────────────────────

function earlyDetectionScore(post) {
  let score = 40;
  const ageHours = post.ageHours || 24;
  const ups = post.rawUps || 0;
  const comments = post.rawComments || 0;
  if (ageHours < 1)  score += 35;
  else if (ageHours < 3)  score += 28;
  else if (ageHours < 6)  score += 20;
  else if (ageHours < 12) score += 12;
  else if (ageHours < 24) score += 6;
  const velocity = ageHours > 0 ? ups / ageHours : ups;
  if (velocity > 5000) score += 20;
  else if (velocity > 2000) score += 15;
  else if (velocity > 500) score += 10;
  else if (velocity > 100) score += 5;
  if (ups > 0 && comments / ups > 0.3) score += 5;
  if (ups > 50000) score += 8;
  else if (ups > 10000) score += 5;
  else if (ups > 1000) score += 3;
  const text = (post.title || "").toLowerCase();
  const bullish = ["shortage","sold out","can't find","waiting list","viral","obsessed","everyone is buying","blew up","just dropped","new launch","going viral"];
  const tradeable = ["boycott","recall","lawsuit","scandal","ban","toxic"];
  for (const kw of bullish) if (text.includes(kw)) { score += 10; break; }
  for (const kw of tradeable) if (text.includes(kw)) { score += 6; break; }
  // Bonus if we have a specific ticker match
  if (findTickers(post.title)) score += 15;
  return Math.min(99, Math.max(30, score));
}

function inferCategory(title, sub) {
  const t = (title||"").toLowerCase();
  const s = (sub||"").toLowerCase();
  if (["skincareaddiction","makeupaddiction","beauty","haircare"].includes(s)) return "Beauty/CPG";
  if (["frugalmalefashion","femalefashionadvice","streetwear","sneakers","thrift"].includes(s)) return "Fashion";
  if (["food","cooking","foodporn","eatcheapandhealthy","coffee","nutrition"].includes(s)) return "Food & Beverage";
  if (["fitness","loseit","gainit","bodyweightfitness","running"].includes(s)) return "Healthcare";
  if (["supplements"].includes(s)) return "Supplements";
  if (["gadgets","technology","hardware","apple","android"].includes(s)) return "Tech";
  if (["personalfinance","investing","wallstreetbets","stocks"].includes(s)) return "Finance";
  if (["gaming"].includes(s)) return "Gaming";
  if (["movies","television","books"].includes(s)) return "Media";
  if (["homeimprovement","gardening","houseplants","diy"].includes(s)) return "Home & Garden";
  if (t.includes("pharma")||t.includes("drug")||t.includes("medicine")) return "Pharma";
  if (t.includes("shoe")||t.includes("sneaker")) return "Footwear";
  if (t.includes("food")||t.includes("drink")||t.includes("restaurant")) return "Food & Beverage";
  if (t.includes("skin")||t.includes("beauty")||t.includes("makeup")) return "Beauty/CPG";
  return "Consumer Goods";
}

function formatAge(h) {
  if (h < 1) return `${Math.round(h*60)}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h/24)}d ago`;
}

// ─── DATA FETCHERS ────────────────────────────────────────────────────────────

async function fetchRedditBatch(subs) {
  const results = [];
  const shuffled = [...subs].sort(() => Math.random()-0.5).slice(0,14);
  await Promise.allSettled(shuffled.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=6`,
        { headers: { "User-Agent": "SocialArbScanner/2.0" } });
      if (!res.ok) return;
      const data = await res.json();
      for (const p of (data?.data?.children||[])) {
        const d = p.data;
        if (!d||d.stickied||d.ups<80) continue;
        const ageHours = (Date.now()/1000 - d.created_utc)/3600;
        const tickerMatch = findTickers(d.title);
        results.push({
          platform: "Reddit",
          trend: d.title.length>90 ? d.title.slice(0,90)+"…" : d.title,
          volume: `${d.ups.toLocaleString()} upvotes · ${formatAge(ageHours)}`,
          category: inferCategory(d.title, sub),
          score: earlyDetectionScore({title:d.title,rawUps:d.ups,rawComments:d.num_comments,ageHours}),
          ageHours, rawUps: d.ups, sub,
          url: `https://reddit.com${d.permalink}`,
          live: true, isEarly: ageHours<6,
          tickerMatch,
        });
      }
    } catch(_) {}
  }));
  return results;
}

async function fetchHackerNews() {
  const results = [];
  try {
    const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const ids = await res.json();
    await Promise.allSettled(ids.slice(0,20).map(async (id) => {
      try {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const item = await r.json();
        if (!item||item.type!=="story"||!item.title) return;
        const ageHours = (Date.now()/1000 - item.time)/3600;
        const tickerMatch = findTickers(item.title);
        results.push({
          platform: "Hacker News",
          trend: item.title.length>90?item.title.slice(0,90)+"…":item.title,
          volume: `${item.score} pts · ${item.descendants||0} comments · ${formatAge(ageHours)}`,
          category: inferCategory(item.title,"tech"),
          score: earlyDetectionScore({title:item.title,rawUps:item.score,rawComments:item.descendants,ageHours}),
          ageHours, rawUps: item.score,
          url: item.url||`https://news.ycombinator.com/item?id=${id}`,
          live:true, isEarly: ageHours<6, tickerMatch,
        });
      } catch(_) {}
    }));
  } catch(_) {}
  return results;
}

async function fetchNewsSubs() {
  const results = [];
  const subs = ["business","Economics","Entrepreneur","marketing","technology","Finance","news"];
  await Promise.allSettled(subs.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`,
        { headers: { "User-Agent": "SocialArbScanner/2.0" } });
      if (!res.ok) return;
      const data = await res.json();
      for (const p of (data?.data?.children||[])) {
        const d = p.data;
        if (!d||d.stickied||d.ups<150) continue;
        const ageHours = (Date.now()/1000 - d.created_utc)/3600;
        const tickerMatch = findTickers(d.title);
        results.push({
          platform: "News",
          trend: d.title.length>90?d.title.slice(0,90)+"…":d.title,
          volume: `${d.ups.toLocaleString()} upvotes · r/${sub} · ${formatAge(ageHours)}`,
          category: inferCategory(d.title,sub),
          score: earlyDetectionScore({title:d.title,rawUps:d.ups,rawComments:d.num_comments,ageHours}),
          ageHours, rawUps: d.ups,
          url:`https://reddit.com${d.permalink}`,
          live:true, isEarly: ageHours<6, tickerMatch,
        });
      }
    } catch(_) {}
  }));
  return results;
}

async function fetchPinterestProxy() {
  const results = [];
  const subs = ["DIY","crafts","recipes","HomeDecor","fitness","wedding","travel","fashion"];
  await Promise.allSettled(subs.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=day&limit=4`,
        { headers: { "User-Agent": "SocialArbScanner/2.0" } });
      if (!res.ok) return;
      const data = await res.json();
      for (const p of (data?.data?.children||[]).slice(0,2)) {
        const d = p.data;
        if (!d||d.ups<80) continue;
        const ageHours = (Date.now()/1000 - d.created_utc)/3600;
        const tickerMatch = findTickers(d.title);
        results.push({
          platform:"Pinterest",
          trend: d.title.length>90?d.title.slice(0,90)+"…":d.title,
          volume:`${d.ups.toLocaleString()} saves · ${formatAge(ageHours)}`,
          category:inferCategory(d.title,sub),
          score:earlyDetectionScore({title:d.title,rawUps:d.ups,ageHours}),
          ageHours, rawUps:d.ups,
          url:`https://reddit.com${d.permalink}`,
          live:true, isEarly:ageHours<6, tickerMatch,
        });
      }
    } catch(_) {}
  }));
  return results;
}

async function fetchYouTubeProxy() {
  const results = [];
  const subs = ["videos","youtubers","TikTokCringe","interestingasfuck","nextfuckinglevel"];
  await Promise.allSettled(subs.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=4`,
        { headers: { "User-Agent": "SocialArbScanner/2.0" } });
      if (!res.ok) return;
      const data = await res.json();
      for (const p of (data?.data?.children||[]).slice(0,2)) {
        const d = p.data;
        if (!d||d.ups<300) continue;
        const ageHours = (Date.now()/1000 - d.created_utc)/3600;
        const tickerMatch = findTickers(d.title);
        results.push({
          platform:"YouTube",
          trend:d.title.length>90?d.title.slice(0,90)+"…":d.title,
          volume:`${d.ups.toLocaleString()} upvotes · ${formatAge(ageHours)}`,
          category:inferCategory(d.title,sub),
          score:earlyDetectionScore({title:d.title,rawUps:d.ups,ageHours}),
          ageHours, rawUps:d.ups,
          url:`https://reddit.com${d.permalink}`,
          live:true, isEarly:ageHours<6, tickerMatch,
        });
      }
    } catch(_) {}
  }));
  return results;
}

async function fetchXProxy() {
  const results = [];
  const subs = ["OutOfTheLoop","NoStupidQuestions","explainlikeimfive","trendingontwitter","entertainment"];
  await Promise.allSettled(subs.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=4`,
        { headers: { "User-Agent": "SocialArbScanner/2.0" } });
      if (!res.ok) return;
      const data = await res.json();
      for (const p of (data?.data?.children||[]).slice(0,2)) {
        const d = p.data;
        if (!d||d.ups<200) continue;
        const ageHours = (Date.now()/1000 - d.created_utc)/3600;
        const tickerMatch = findTickers(d.title);
        results.push({
          platform:"X/Twitter",
          trend:d.title.length>90?d.title.slice(0,90)+"…":d.title,
          volume:`${d.ups.toLocaleString()} upvotes · ${formatAge(ageHours)}`,
          category:inferCategory(d.title,sub),
          score:earlyDetectionScore({title:d.title,rawUps:d.ups,ageHours}),
          ageHours, rawUps:d.ups,
          url:`https://reddit.com${d.permalink}`,
          live:true, isEarly:ageHours<6, tickerMatch,
        });
      }
    } catch(_) {}
  }));
  return results;
}

// ─── CLAUDE API ───────────────────────────────────────────────────────────────

async function generateConvictionDoc(trend, apiKey) {
  const tickerInfo = trend.tickerMatch
    ? `SPECIFIC TICKER MATCH FOUND: ${trend.tickerMatch.tickers.join(", ")} (${trend.tickerMatch.company}) — matched on keyword "${trend.tickerMatch.matched}"`
    : `Category tickers: ${(FALLBACK_TICKER_MAP[trend.category]||["AMZN"]).join(", ")}`;

  const prompt = `You are a social arbitrage trader in the style of Chris Camillo. Generate a full conviction trade document for this viral social trend.

TREND: ${trend.trend}
PLATFORM: ${trend.platform}
VOLUME: ${trend.volume}
CATEGORY: ${trend.category}
AGE: ${trend.ageHours ? Math.round(trend.ageHours)+"h old" : "Unknown"}
EARLY SIGNAL: ${trend.isEarly ? "YES - under 6 hours" : "No"}
${tickerInfo}

Examples of great social arb trades:
- Needoh toy going viral on TikTok → GAIN stock (toy distributor)
- Sweetgreen chicken caesar wrap viral moment → CARM stock
- Protein craze spreading across fitness communities → SMPL (Simply Good Foods)
- Peptide trend on wellness TikTok → HIMS stock
- Stanley tumbler selling out everywhere → YETI competition effect

Generate a conviction document. Respond ONLY with raw JSON (no markdown, no backticks):
{
  "conviction": "HIGH" or "MEDIUM" or "LOW",
  "convictionScore": number 1-100,
  "headline": "One punchy headline for this trade idea (e.g. 'Sweetgreen Chicken Caesar Wrap = $CARM Long')",
  "tickers": ["PRIMARY_TICKER", "SECONDARY_TICKER"],
  "primaryTicker": "THE SINGLE BEST TICKER to play this",
  "company": "Company name behind primary ticker",
  "direction": "LONG" or "SHORT",
  "thesis": "3-4 sentence thesis: viral social signal → consumer behavior shift → revenue impact → stock move",
  "earlyEdge": "Why catching this TODAY vs in 2 weeks matters for entry price",
  "entryZone": "Suggested entry price range e.g. $12-14",
  "priceTarget": "Price target e.g. $18-22",
  "timeframe": "e.g. 4-8 weeks",
  "stopLoss": "Stop loss level e.g. $10.50",
  "positionSize": "Suggested position sizing e.g. 2-3% of portfolio",
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3"],
  "risks": ["risk 1", "risk 2"],
  "socialProof": ["social signal 1", "social signal 2", "social signal 3"],
  "historicalComp": "A past social arb trade that is similar and what happened",
  "wallStreetBlindSpot": "What institutional analysts are missing that social data reveals"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

function Label({ children, color="#252525" }) {
  return <div style={{ fontSize:"0.5rem", color, fontFamily:"'IBM Plex Mono',monospace",
    letterSpacing:"0.15em", marginBottom:"8px", textTransform:"uppercase" }}>{children}</div>;
}

function Tag({ children, color="#00ff9d" }) {
  return <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.68rem",
    color, background:`${color}10`, border:`1px solid ${color}30`,
    padding:"3px 10px", borderRadius:"3px", fontWeight:"700" }}>{children}</span>;
}

function ScoreRing({ score }) {
  const color = score>=85?"#00ff9d":score>=70?"#ffd700":"#ff4500";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
      <div style={{ width:"44px", height:"44px", borderRadius:"50%",
        border:`2px solid ${color}30`, background:`${color}08`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 0 12px ${color}20` }}>
        <span style={{ fontSize:"0.8rem", fontFamily:"'IBM Plex Mono',monospace",
          fontWeight:"700", color }}>{score}</span>
      </div>
      <span style={{ fontSize:"0.45rem", color:"#252525", fontFamily:"'IBM Plex Mono',monospace",
        letterSpacing:"0.1em" }}>SCORE</span>
    </div>
  );
}

function ConvictionDoc({ doc, trend, onClose }) {
  const convColor = doc.conviction==="HIGH"?"#00ff9d":doc.conviction==="MEDIUM"?"#ffd700":"#ff4500";
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#000000ee",
      zIndex:1000, overflowY:"auto", display:"flex", justifyContent:"center", padding:"40px 20px" }}
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#0a0a0a", border:"1px solid #1e1e1e", borderTop:`3px solid ${convColor}`,
        maxWidth:"800px", width:"100%", borderRadius:"4px", padding:"36px",
        animation:"fadeUp 0.3s ease both", height:"fit-content" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"28px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.55rem", color:convColor, fontFamily:"'IBM Plex Mono',monospace",
                letterSpacing:"0.2em", border:`1px solid ${convColor}44`, padding:"3px 10px",
                background:`${convColor}10` }}>{doc.conviction} CONVICTION</span>
              <span style={{ fontSize:"0.55rem", color:"#333", fontFamily:"'IBM Plex Mono',monospace",
                letterSpacing:"0.15em" }}>CONVICTION SCORE: {doc.convictionScore}/100</span>
              <span style={{ fontSize:"0.55rem", color: doc.direction==="LONG"?"#00ff9d":"#ff4500",
                fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.15em",
                border:`1px solid ${doc.direction==="LONG"?"#00ff9d33":"#ff450033"}`,
                padding:"3px 10px", background:doc.direction==="LONG"?"#00ff9d10":"#ff450010" }}>
                {doc.direction}
              </span>
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.3rem", fontWeight:"800",
              color:"#f0f0f0", lineHeight:"1.2", marginBottom:"8px", letterSpacing:"-0.02em" }}>
              {doc.headline}
            </h2>
            <div style={{ fontSize:"0.65rem", color:"#333", fontFamily:"'IBM Plex Mono',monospace" }}>
              {trend.platform} · {trend.volume}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"1px solid #1e1e1e",
            color:"#444", width:"32px", height:"32px", borderRadius:"3px", cursor:"pointer",
            fontSize:"1rem", flexShrink:0 }}>✕</button>
        </div>

        {/* Primary ticker big display */}
        <div style={{ background:"#0d0d0d", border:"1px solid #161616", borderLeft:`3px solid ${convColor}`,
          padding:"20px 24px", marginBottom:"24px", display:"flex",
          alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <div style={{ fontSize:"2.2rem", fontFamily:"'IBM Plex Mono',monospace", fontWeight:"700",
              color:convColor, letterSpacing:"-0.02em" }}>${doc.primaryTicker}</div>
            <div style={{ fontSize:"0.65rem", color:"#444", fontFamily:"'IBM Plex Mono',monospace",
              marginTop:"4px" }}>{doc.company}</div>
          </div>
          <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
            {[
              { label:"ENTRY ZONE", value:doc.entryZone, color:"#e8e8e8" },
              { label:"TARGET", value:doc.priceTarget, color:"#00ff9d" },
              { label:"STOP LOSS", value:doc.stopLoss, color:"#ff4500" },
              { label:"TIMEFRAME", value:doc.timeframe, color:"#ffd700" },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"0.75rem", fontFamily:"'IBM Plex Mono',monospace",
                  fontWeight:"700", color:s.color, marginBottom:"3px" }}>{s.value}</div>
                <div style={{ fontSize:"0.48rem", color:"#252525", fontFamily:"'IBM Plex Mono',monospace",
                  letterSpacing:"0.12em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All tickers */}
        {doc.tickers?.length > 1 && (
          <div style={{ marginBottom:"20px" }}>
            <Label color="#252525">ALL TICKERS TO WATCH</Label>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {doc.tickers.map(t=><Tag key={t}>${t}</Tag>)}
            </div>
          </div>
        )}

        {/* Position sizing */}
        <div style={{ background:"#ffd70008", border:"1px solid #ffd70018", padding:"14px 16px",
          borderRadius:"3px", marginBottom:"20px" }}>
          <Label color="#ffd70066">POSITION SIZING</Label>
          <div style={{ fontSize:"0.82rem", color:"#ffd700bb", fontFamily:"'Syne',sans-serif" }}>
            {doc.positionSize}
          </div>
        </div>

        {/* Thesis */}
        <div style={{ marginBottom:"20px" }}>
          <Label>TRADE THESIS</Label>
          <p style={{ fontSize:"0.82rem", color:"#aaa", lineHeight:"1.8", fontFamily:"'Syne',sans-serif" }}>
            {doc.thesis}
          </p>
        </div>

        {/* Early edge */}
        <div style={{ background:"#00ff9d08", border:"1px solid #00ff9d18", padding:"14px 16px",
          borderRadius:"3px", marginBottom:"20px" }}>
          <Label color="#00ff9d66">WHY ACT NOW — EARLY EDGE</Label>
          <p style={{ fontSize:"0.8rem", color:"#00ff9dbb", lineHeight:"1.6", fontFamily:"'Syne',sans-serif" }}>
            {doc.earlyEdge}
          </p>
        </div>

        {/* Grid: catalysts + risks + social proof */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", marginBottom:"20px" }}>
          <div>
            <Label>CATALYSTS</Label>
            {(doc.catalysts||[]).map((c,i)=>(
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px", alignItems:"flex-start" }}>
                <span style={{ color:"#00ff9d", fontSize:"0.7rem", flexShrink:0 }}>+</span>
                <span style={{ color:"#666", fontSize:"0.73rem", lineHeight:"1.5", fontFamily:"'Syne',sans-serif" }}>{c}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>RISKS</Label>
            {(doc.risks||[]).map((r,i)=>(
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px", alignItems:"flex-start" }}>
                <span style={{ color:"#ff4500", fontSize:"0.7rem", flexShrink:0 }}>−</span>
                <span style={{ color:"#666", fontSize:"0.73rem", lineHeight:"1.5", fontFamily:"'Syne',sans-serif" }}>{r}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>SOCIAL PROOF</Label>
            {(doc.socialProof||[]).map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px", alignItems:"flex-start" }}>
                <span style={{ color:"#4a9eff", fontSize:"0.7rem", flexShrink:0 }}>◎</span>
                <span style={{ color:"#666", fontSize:"0.73rem", lineHeight:"1.5", fontFamily:"'Syne',sans-serif" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical comp */}
        <div style={{ background:"#4a9eff08", border:"1px solid #4a9eff18", padding:"14px 16px",
          borderRadius:"3px", marginBottom:"20px" }}>
          <Label color="#4a9eff66">HISTORICAL COMPARABLE TRADE</Label>
          <p style={{ fontSize:"0.8rem", color:"#4a9effbb", lineHeight:"1.6", fontFamily:"'Syne',sans-serif" }}>
            {doc.historicalComp}
          </p>
        </div>

        {/* Wall Street blind spot */}
        <div style={{ background:"#e1306c08", border:"1px solid #e1306c18", padding:"14px 16px",
          borderRadius:"3px", marginBottom:"28px" }}>
          <Label color="#e1306c66">WALL STREET BLIND SPOT</Label>
          <p style={{ fontSize:"0.8rem", color:"#e1306cbb", lineHeight:"1.6", fontFamily:"'Syne',sans-serif" }}>
            {doc.wallStreetBlindSpot}
          </p>
        </div>

        <div style={{ borderTop:"1px solid #111", paddingTop:"16px", display:"flex",
          justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
          <span style={{ fontSize:"0.52rem", color:"#1a1a1a", fontFamily:"'IBM Plex Mono',monospace",
            letterSpacing:"0.1em" }}>NOT FINANCIAL ADVICE · EDUCATIONAL PURPOSES ONLY</span>
          <button onClick={onClose} style={{ background:"transparent", border:"1px solid #1e1e1e",
            color:"#444", padding:"8px 20px", fontSize:"0.6rem",
            fontFamily:"'IBM Plex Mono',monospace", cursor:"pointer", borderRadius:"3px",
            letterSpacing:"0.1em", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="#00ff9d44"; e.currentTarget.style.color="#00ff9d"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e1e1e"; e.currentTarget.style.color="#444"; }}>
            CLOSE REPORT
          </button>
        </div>
      </div>
    </div>
  );
}

function TrendCard({ trend, index, apiKey, onHotTrade }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const cfg = PLATFORM_CONFIG[trend.platform]||{color:"#888",icon:"•",label:trend.platform};
  const hasTickerMatch = !!trend.tickerMatch;

  const analyze = useCallback(async () => {
    if (doc) { setShowDoc(true); return; }
    setLoading(true);
    const result = await generateConvictionDoc(trend, apiKey);
    setDoc(result);
    setLoading(false);
    setShowDoc(true);
    if (result?.conviction==="HIGH" && onHotTrade) onHotTrade({ trend, doc: result });
  }, [doc, trend, apiKey, onHotTrade]);

  return (
    <>
      {showDoc && doc && <ConvictionDoc doc={doc} trend={trend} onClose={()=>setShowDoc(false)} />}
      <div style={{ borderBottom:"1px solid #0f0f0f", transition:"background 0.15s",
        animation:`fadeUp 0.4s ease ${Math.min(index*0.03,0.5)}s both`,
        borderLeft: hasTickerMatch ? "2px solid #ffd70033" : "none" }}
        onMouseEnter={e=>e.currentTarget.style.background="#0c0c0c"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{ padding:"16px 28px", display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap" }}>

          <span style={{ color:"#252525", fontSize:"0.6rem", fontFamily:"'IBM Plex Mono',monospace",
            fontWeight:"700", minWidth:"20px" }}>{String(index+1).padStart(2,"0")}</span>

          <div style={{ width:"28px", height:"28px", borderRadius:"4px", background:`${cfg.color}15`,
            border:`1px solid ${cfg.color}25`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"0.75rem", color:cfg.color, flexShrink:0 }}>
            {cfg.icon}
          </div>

          <div style={{ flex:1, minWidth:"180px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.55rem", color:cfg.color, fontFamily:"'IBM Plex Mono',monospace",
                letterSpacing:"0.1em" }}>{cfg.label}</span>
              {trend.live && (
                <span style={{ fontSize:"0.52rem", color:"#00ff9d", background:"#00ff9d12",
                  border:"1px solid #00ff9d33", padding:"1px 6px", borderRadius:"2px",
                  display:"inline-flex", alignItems:"center", gap:"4px" }}>
                  <span style={{ width:"3px", height:"3px", borderRadius:"50%", background:"#00ff9d",
                    display:"inline-block", animation:"blink 1.5s infinite" }}/>LIVE
                </span>
              )}
              {trend.isEarly && (
                <span style={{ fontSize:"0.52rem", color:"#ffd700", background:"#ffd70012",
                  border:"1px solid #ffd70033", padding:"1px 6px", borderRadius:"2px",
                  animation:"pulse 2s infinite" }}>⚡ EARLY</span>
              )}
              {hasTickerMatch && (
                <span style={{ fontSize:"0.52rem", color:"#e1306c", background:"#e1306c12",
                  border:"1px solid #e1306c33", padding:"1px 6px", borderRadius:"2px" }}>
                  🎯 {trend.tickerMatch.tickers[0]}
                </span>
              )}
            </div>
            <div style={{ fontSize:"0.86rem", color:"#e0e0e0", fontFamily:"'Syne',sans-serif",
              fontWeight:"700", marginBottom:"4px", lineHeight:"1.3" }}>{trend.trend}</div>
            <div style={{ fontSize:"0.6rem", color:"#2a2a2a", fontFamily:"'IBM Plex Mono',monospace" }}>
              {trend.volume}
              {trend.sub && <span> · r/{trend.sub}</span>}
              {hasTickerMatch && <span style={{ color:"#ffd70044" }}> · matched: {trend.tickerMatch.company}</span>}
            </div>
          </div>

          <ScoreRing score={trend.score} />

          <button onClick={analyze} disabled={loading} style={{
            background: doc ? "#00ff9d" : hasTickerMatch ? "#ffd70015" : "transparent",
            border:`1px solid ${doc?"#00ff9d":hasTickerMatch?"#ffd70044":"#1e1e1e"}`,
            color: doc?"#000":hasTickerMatch?"#ffd700":"#444",
            padding:"8px 16px", fontSize:"0.58rem", fontFamily:"'IBM Plex Mono',monospace",
            letterSpacing:"0.1em", cursor:loading?"wait":"pointer",
            borderRadius:"3px", transition:"all 0.15s", whiteSpace:"nowrap", fontWeight:"700",
          }}
            onMouseEnter={e=>{ if(!doc){ e.currentTarget.style.borderColor="#00ff9d"; e.currentTarget.style.color="#00ff9d"; e.currentTarget.style.background="transparent"; }}}
            onMouseLeave={e=>{ if(!doc){ e.currentTarget.style.borderColor=hasTickerMatch?"#ffd70044":"#1e1e1e"; e.currentTarget.style.color=hasTickerMatch?"#ffd700":"#444"; e.currentTarget.style.background=hasTickerMatch?"#ffd70015":"transparent"; }}}
          >
            {loading?"GENERATING...":doc?"📄 VIEW REPORT":"⚡ GENERATE REPORT"}
          </button>
        </div>
        {loading && (
          <div style={{ height:"1px", background:"#0d0d0d", overflow:"hidden" }}>
            <div style={{ height:"100%", width:"40%", background:"linear-gradient(90deg,transparent,#00ff9d,transparent)",
              animation:"scan 1s ease-in-out infinite" }}/>
          </div>
        )}
      </div>
    </>
  );
}

function HotTradesBar({ hotTrades }) {
  if (hotTrades.length===0) return null;
  return (
    <div style={{ background:"#0d0d0d", borderBottom:"1px solid #161616", padding:"12px 28px",
      display:"flex", alignItems:"center", gap:"16px", overflowX:"auto" }}>
      <span style={{ fontSize:"0.55rem", color:"#00ff9d", fontFamily:"'IBM Plex Mono',monospace",
        letterSpacing:"0.15em", whiteSpace:"nowrap", animation:"pulse 2s infinite" }}>
        🔥 HOT TRADES
      </span>
      {hotTrades.map((t,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0,
          background:"#00ff9d0a", border:"1px solid #00ff9d22", padding:"6px 14px", borderRadius:"3px" }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.7rem",
            color:"#00ff9d", fontWeight:"700" }}>${t.doc?.primaryTicker}</span>
          <span style={{ fontSize:"0.65rem", color:"#444", fontFamily:"'Syne',sans-serif",
            maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {t.trend?.trend?.slice(0,40)}…
          </span>
          <span style={{ fontSize:"0.55rem", color:"#ffd700", fontFamily:"'IBM Plex Mono',monospace" }}>
            {t.doc?.priceTarget}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [trends, setTrends] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [hotTrades, setHotTrades] = useState([]);
  const [stats, setStats] = useState({ live:0, early:0, total:0, withTickers:0 });
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;

  useEffect(() => {
    const t = setInterval(()=>setClock(new Date().toLocaleTimeString()),1000);
    return ()=>clearInterval(t);
  },[]);

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const [reddit, hn, news, pinterest, youtube, x] = await Promise.allSettled([
        fetchRedditBatch(REDDIT_SUBS),
        fetchHackerNews(),
        fetchNewsSubs(),
        fetchPinterestProxy(),
        fetchYouTubeProxy(),
        fetchXProxy(),
      ]);
      const all = [
        ...(reddit.value||[]), ...(hn.value||[]), ...(news.value||[]),
        ...(pinterest.value||[]), ...(youtube.value||[]), ...(x.value||[]),
      ];
      const seen = new Set();
      const deduped = all.filter(t=>{
        const key = t.trend.slice(0,40).toLowerCase();
        if(seen.has(key)) return false;
        seen.add(key); return true;
      });
      const sorted = deduped.sort((a,b)=>b.score-a.score);
      setTrends(sorted);
      setStats({
        live: sorted.filter(t=>t.live).length,
        early: sorted.filter(t=>t.isEarly).length,
        total: sorted.length,
        withTickers: sorted.filter(t=>t.tickerMatch).length,
      });
    } catch(e){ console.error(e); }
    setLoading(false);
  },[]);

  useEffect(()=>{ loadTrends(); },[loadTrends]);

  const handleHotTrade = useCallback((trade) => {
    setHotTrades(prev => {
      const exists = prev.find(t=>t.doc?.primaryTicker===trade.doc?.primaryTicker);
      if(exists) return prev;
      return [trade, ...prev].slice(0,8);
    });
  },[]);

  const filtered = filter==="All" ? trends : trends.filter(t=>t.platform===filter);

  return (
    <div style={{ minHeight:"100vh", background:"#070707", color:"#e8e8e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#070707;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
        button{outline:none;font-family:inherit;}
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom:"1px solid #0f0f0f", padding:"9px 28px", display:"flex",
        alignItems:"center", justifyContent:"space-between", background:"#050505",
        position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:"8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#00ff9d",
              animation:"blink 1.5s infinite", boxShadow:"0 0 8px #00ff9d" }}/>
            <span style={{ fontSize:"0.56rem", color:"#333", fontFamily:"'IBM Plex Mono',monospace",
              letterSpacing:"0.12em" }}>LIVE SCAN</span>
          </div>
          <span style={{ color:"#1e1e1e", fontSize:"0.56rem", fontFamily:"'IBM Plex Mono',monospace" }}>{clock}</span>
          <span style={{ color:"#1e1e1e", fontSize:"0.56rem", fontFamily:"'IBM Plex Mono',monospace" }}>
            {stats.total} SIGNALS · {stats.early} EARLY · {stats.withTickers} TICKER MATCHES
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"0.56rem", color:"#1a1a1a", fontFamily:"'IBM Plex Mono',monospace",
            letterSpacing:"0.12em" }}>SOCIAL ARB SCANNER v2</span>
          <button onClick={loadTrends} disabled={loading} style={{
            background:"transparent", border:"1px solid #181818", color:"#333",
            padding:"4px 12px", fontSize:"0.56rem", fontFamily:"'IBM Plex Mono',monospace",
            cursor:"pointer", borderRadius:"2px", letterSpacing:"0.08em", transition:"all 0.2s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="#00ff9d44"; e.currentTarget.style.color="#00ff9d"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="#181818"; e.currentTarget.style.color="#333"; }}
          >{loading?"SCANNING...":"↻ REFRESH"}</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding:"48px 28px 32px", borderBottom:"1px solid #0e0e0e",
        background:"radial-gradient(ellipse at 10% 60%, #00ff9d06 0%, transparent 55%), radial-gradient(ellipse at 90% 20%, #ffd70004 0%, transparent 50%)" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex",
          alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"28px" }}>
          <div style={{ animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontSize:"0.54rem", color:"#00ff9d", fontFamily:"'IBM Plex Mono',monospace",
              letterSpacing:"0.25em", marginBottom:"14px", animation:"pulse 3s infinite" }}>
              SOCIAL ARBITRAGE · INSPIRED BY CHRIS CAMILLO
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(2.2rem,5.5vw,4.5rem)",
              fontWeight:"800", lineHeight:"0.9", letterSpacing:"-0.03em", color:"#f0f0f0", marginBottom:"16px" }}>
              FIND THE TRADE<br /><span style={{ color:"#00ff9d" }}>BEFORE</span><br />WALL STREET
            </h1>
            <p style={{ color:"#303030", fontSize:"0.78rem", lineHeight:"1.8", maxWidth:"420px",
              fontFamily:"'Syne',sans-serif" }}>
              Scans Reddit, HN, Pinterest, YouTube & X for viral trends. 
              Maps each trend to specific stock tickers. Generates full conviction 
              trade documents with entry, target, stop loss & thesis.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px",
            animation:"fadeUp 0.5s ease 0.1s both" }}>
            {[
              { label:"TOTAL SIGNALS", value:loading?"—":stats.total, color:"#e8e8e8" },
              { label:"⚡ EARLY SIGNALS", value:loading?"—":stats.early, color:"#ffd700" },
              { label:"🎯 TICKER MATCHES", value:loading?"—":stats.withTickers, color:"#00ff9d" },
              { label:"🔥 HOT TRADES", value:hotTrades.length, color:"#e1306c" },
            ].map(s=>(
              <div key={s.label} style={{ background:"#0a0a0a", border:"1px solid #111",
                padding:"16px 18px", minWidth:"105px" }}>
                <div style={{ fontSize:"1.8rem", fontFamily:"'IBM Plex Mono',monospace",
                  fontWeight:"700", color:s.color, lineHeight:"1", marginBottom:"5px" }}>{s.value}</div>
                <div style={{ fontSize:"0.48rem", color:"#252525", fontFamily:"'IBM Plex Mono',monospace",
                  letterSpacing:"0.12em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hot trades bar */}
      <HotTradesBar hotTrades={hotTrades} />

      {/* Filter bar */}
      <div style={{ borderBottom:"1px solid #0e0e0e", background:"#080808", overflowX:"auto" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex" }}>
          {PLATFORMS.map(p=>{
            const cfg = PLATFORM_CONFIG[p];
            const active = filter===p;
            return (
              <button key={p} onClick={()=>setFilter(p)} style={{
                background:"transparent",
                borderBottom:`2px solid ${active?(cfg?.color||"#00ff9d"):"transparent"}`,
                borderTop:"none", borderLeft:"none", borderRight:"none",
                color:active?(cfg?.color||"#e8e8e8"):"#252525",
                padding:"12px 16px", fontSize:"0.56rem",
                fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.1em",
                cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
                fontWeight:active?"700":"400",
              }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.color="#444"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.color="#252525"; }}
              >{p==="All"?"ALL SIGNALS":p.toUpperCase()}</button>
            );
          })}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", padding:"0 16px",
            fontSize:"0.5rem", color:"#1a1a1a", fontFamily:"'IBM Plex Mono',monospace",
            whiteSpace:"nowrap", letterSpacing:"0.1em" }}>
            {loading?"⚡ SCANNING ALL PLATFORMS...":`${filtered.length} SIGNALS · 🎯 = TICKER MATCH · ⚡ = EARLY`}
          </div>
        </div>
      </div>

      {/* Trend list */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", paddingBottom:"80px" }}>
        {loading ? (
          <div style={{ padding:"80px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"#252525", fontFamily:"'IBM Plex Mono',monospace",
              letterSpacing:"0.2em", animation:"pulse 1.5s infinite", marginBottom:"12px" }}>
              SCANNING ALL PLATFORMS FOR EARLY TRADE IDEAS...
            </div>
            <div style={{ fontSize:"0.5rem", color:"#181818", fontFamily:"'IBM Plex Mono',monospace",
              letterSpacing:"0.15em" }}>REDDIT · HACKER NEWS · PINTEREST · YOUTUBE · X/TWITTER</div>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:"60px 28px", textAlign:"center", color:"#252525",
            fontSize:"0.62rem", fontFamily:"'IBM Plex Mono',monospace" }}>
            NO SIGNALS · TRY REFRESHING
          </div>
        ) : (
          filtered.map((trend,i)=>(
            <TrendCard key={`${trend.platform}-${trend.trend.slice(0,20)}-${i}`}
              trend={trend} index={i} apiKey={apiKey} onHotTrade={handleHotTrade} />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid #0a0a0a", padding:"18px 28px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:"8px", background:"#050505" }}>
        <span style={{ color:"#111", fontSize:"0.52rem", fontFamily:"'IBM Plex Mono',monospace",
          letterSpacing:"0.1em" }}>NOT FINANCIAL ADVICE · EDUCATIONAL PURPOSES ONLY</span>
        <span style={{ color:"#111", fontSize:"0.52rem", fontFamily:"'IBM Plex Mono',monospace",
          letterSpacing:"0.1em" }}>SOCIAL ARB SCANNER v2 · INSPIRED BY CHRIS CAMILLO</span>
      </div>
    </div>
  );
}