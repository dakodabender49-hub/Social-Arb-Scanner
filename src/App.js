import { useState, useCallback } from "react";

const PLATFORMS = ["TikTok", "Instagram", "Google Trends", "Reddit", "X/Twitter"];

const MOCK_TRENDS = [
  { platform: "TikTok", trend: "#StanleyTumbler", volume: "4.2M posts", category: "Consumer Goods" },
  { platform: "Google Trends", trend: "HIMS hair loss treatment", volume: "+890% search spike", category: "Healthcare" },
  { platform: "Reddit", trend: "r/skincareaddiction - CeraVe shortage", volume: "42k upvotes", category: "Beauty/CPG" },
  { platform: "Instagram", trend: "#cleangirl aesthetic makeup", volume: "9.1M posts", category: "Beauty" },
  { platform: "X/Twitter", trend: "Birkenstock sold out everywhere", volume: "Trending #4 US", category: "Footwear" },
  { platform: "TikTok", trend: "#BookTok fantasy novels", volume: "2.8M posts", category: "Media/Publishing" },
  { platform: "Google Trends", trend: "Ozempic compounding pharmacy", volume: "+1200% YoY", category: "Pharma" },
  { platform: "Instagram", trend: "Athletic Greens AG1 unboxing", volume: "6.3M posts", category: "Supplements" },
];

const TICKER_MAP = {
  "Consumer Goods": ["YETI", "SBUX", "TGT"],
  "Healthcare": ["HIMS", "AMZN", "CVS"],
  "Beauty/CPG": ["ULTA", "EL", "PG"],
  "Beauty": ["ELF", "COTY", "ULTA"],
  "Footwear": ["BIRK", "NKE", "SKX"],
  "Media/Publishing": ["AMZN", "NFLX", "PRH"],
  "Pharma": ["NVO", "LLY", "AMGN"],
  "Supplements": ["NBEV", "AMZN", "HIMS"],
};

const PLATFORM_COLORS = {
  "TikTok": "#00f2ea",
  "Instagram": "#e1306c",
  "Google Trends": "#fbbc05",
  "Reddit": "#ff4500",
  "X/Twitter": "#e7e7e7",
};

const CONVICTION_COLORS = {
  "HIGH": { bg: "#00ff9d22", border: "#00ff9d", text: "#00ff9d" },
  "MEDIUM": { bg: "#ffd70022", border: "#ffd700", text: "#ffd700" },
  "LOW": { bg: "#ff450022", border: "#ff4500", text: "#ff4500" },
};

async function analyzeWithClaude(trend) {
  const prompt = `You are a social arbitrage trader in the style of Chris Camillo. Analyze this social trend for a tradeable stock opportunity:

Platform: ${trend.platform}
Trend: ${trend.trend}
Volume/Signal: ${trend.volume}
Category: ${trend.category}

Respond ONLY with a JSON object (no markdown, no backticks) with these exact fields:
{
  "conviction": "HIGH" or "MEDIUM" or "LOW",
  "thesis": "2-3 sentence trading thesis explaining the social trend → consumer behavior → stock impact chain",
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3"],
  "risks": ["risk 1", "risk 2"],
  "tickers": ["TICK1", "TICK2"],
  "timeframe": "e.g. 2-8 weeks",
  "edge": "One sentence on why this is a social arb edge specifically — what Wall Street is missing"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
},
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function PlatformBadge({ platform }) {
  const color = PLATFORM_COLORS[platform] || "#aaa";
  return (
    <span style={{
      fontSize: "0.65rem",
      fontFamily: "'Space Mono', monospace",
      letterSpacing: "0.08em",
      color,
      border: `1px solid ${color}44`,
      background: `${color}11`,
      padding: "2px 8px",
      borderRadius: "2px",
      textTransform: "uppercase",
    }}>{platform}</span>
  );
}

function ConvictionBadge({ conviction }) {
  if (!conviction) return null;
  const c = CONVICTION_COLORS[conviction] || CONVICTION_COLORS["LOW"];
  return (
    <span style={{
      fontSize: "0.65rem",
      fontFamily: "'Space Mono', monospace",
      letterSpacing: "0.1em",
      color: c.text,
      border: `1px solid ${c.border}`,
      background: c.bg,
      padding: "2px 10px",
      borderRadius: "2px",
    }}>{conviction} CONVICTION</span>
  );
}

function TickerTag({ ticker }) {
  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: "0.75rem",
      color: "#00ff9d",
      background: "#00ff9d11",
      border: "1px solid #00ff9d33",
      padding: "3px 10px",
      borderRadius: "2px",
      letterSpacing: "0.05em",
    }}>${ticker}</span>
  );
}

function TrendCard({ trend, index }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const analyze = useCallback(async () => {
    if (analysis) { setExpanded(e => !e); return; }
    setLoading(true);
    const result = await analyzeWithClaude(trend);
    setAnalysis(result);
    setLoading(false);
    setExpanded(true);
  }, [analysis, trend]);

  const tickers = analysis?.tickers || TICKER_MAP[trend.category] || [];

  return (
    <div style={{
      background: "#0d0d0d",
      border: "1px solid #1e1e1e",
      borderLeft: `3px solid ${PLATFORM_COLORS[trend.platform] || "#333"}`,
      padding: "20px 24px",
      marginBottom: "2px",
      transition: "border-color 0.2s",
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
            <PlatformBadge platform={trend.platform} />
            <span style={{ color: "#444", fontSize: "0.7rem" }}>#{String(index + 1).padStart(2, "0")}</span>
            {analysis && <ConvictionBadge conviction={analysis.conviction} />}
          </div>
          <div style={{ fontSize: "1.05rem", color: "#f0f0f0", fontWeight: "bold", marginBottom: "6px", letterSpacing: "-0.01em" }}>
            {trend.trend}
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ color: "#555", fontSize: "0.7rem" }}>{trend.volume}</span>
            <span style={{ color: "#333", fontSize: "0.7rem" }}>·</span>
            <span style={{ color: "#555", fontSize: "0.7rem" }}>{trend.category}</span>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            background: loading ? "#1a1a1a" : expanded ? "#0a1a0f" : "#001a0a",
            border: `1px solid ${loading ? "#333" : expanded ? "#00ff9d66" : "#00ff9d33"}`,
            color: loading ? "#555" : "#00ff9d",
            padding: "8px 18px",
            fontSize: "0.7rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.08em",
            cursor: loading ? "wait" : "pointer",
            borderRadius: "2px",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
        >
          {loading ? "ANALYZING..." : expanded ? "▲ COLLAPSE" : "▶ ANALYZE"}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: "16px", height: "2px", background: "#1a1a1a", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: "60%", background: "linear-gradient(90deg, transparent, #00ff9d, transparent)",
            animation: "scan 1.2s ease-in-out infinite",
          }} />
        </div>
      )}

      {expanded && analysis && (
        <div style={{ marginTop: "20px", borderTop: "1px solid #1a1a1a", paddingTop: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: "8px" }}>THESIS</div>
            <div style={{ color: "#c8c8c8", fontSize: "0.85rem", lineHeight: "1.7" }}>{analysis.thesis}</div>
          </div>
          <div style={{ background: "#00ff9d08", border: "1px solid #00ff9d22", padding: "12px 16px", borderRadius: "2px", marginBottom: "20px" }}>
            <div style={{ color: "#00ff9d88", fontSize: "0.6rem", letterSpacing: "0.12em", marginBottom: "6px" }}>SOCIAL ARB EDGE</div>
            <div style={{ color: "#00ff9dcc", fontSize: "0.8rem", lineHeight: "1.6" }}>{analysis.edge}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <div style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: "8px" }}>CATALYSTS</div>
              {(analysis.catalysts || []).map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: "#00ff9d", fontSize: "0.7rem" }}>+</span>
                  <span style={{ color: "#999", fontSize: "0.75rem", lineHeight: "1.5" }}>{c}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: "8px" }}>RISKS</div>
              {(analysis.risks || []).map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: "#ff4500", fontSize: "0.7rem" }}>−</span>
                  <span style={{ color: "#999", fontSize: "0.75rem", lineHeight: "1.5" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {tickers.map(t => <TickerTag key={t} ticker={t} />)}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#444", letterSpacing: "0.08em" }}>
              TIMEFRAME: <span style={{ color: "#888" }}>{analysis.timeframe || "TBD"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color = "#00ff9d" }) {
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", padding: "16px 24px", flex: "1 1 150px" }}>
      <div style={{ color: "#444", fontSize: "0.6rem", letterSpacing: "0.15em", fontFamily: "'Space Mono', monospace", marginBottom: "6px" }}>{label}</div>
      <div style={{ color, fontSize: "1.4rem", fontFamily: "'Space Mono', monospace", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [trends] = useState(MOCK_TRENDS);
  const [filter, setFilter] = useState("ALL");
  const [scanTime] = useState(new Date().toLocaleTimeString());

  const filtered = filter === "ALL" ? trends : trends.filter(t => t.platform === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0f0f0", fontFamily: "'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#080808", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff9d", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: "0.65rem", color: "#555", letterSpacing: "0.12em" }}>LIVE SCAN</span>
          <span style={{ color: "#333" }}>|</span>
          <span style={{ fontSize: "0.65rem", color: "#333", letterSpacing: "0.08em" }}>LAST UPDATED {scanTime}</span>
        </div>
        <div style={{ fontSize: "0.65rem", color: "#444", letterSpacing: "0.1em" }}>SOCIAL ARB SCANNER v1.0 · PUBLIC ACCESS</div>
      </div>

      <div style={{ padding: "48px 32px 32px", borderBottom: "1px solid #111" }}>
        <div style={{ maxWidth: "900px" }}>
          <div style={{ fontSize: "0.65rem", color: "#00ff9d", letterSpacing: "0.2em", marginBottom: "12px" }}>SOCIAL ARBITRAGE INTELLIGENCE</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "0.02em", lineHeight: "0.9", color: "#f0f0f0", marginBottom: "20px" }}>
            TREND→<span style={{ color: "#00ff9d" }}>TRADE</span><br />SCANNER
          </h1>
          <p style={{ color: "#555", fontSize: "0.8rem", lineHeight: "1.8", maxWidth: "560px", letterSpacing: "0.02em" }}>
            Surfaces viral trends across TikTok, Instagram, Google, Reddit & X — then uses AI to analyze each as a potential stock trade opportunity. Inspired by Chris Camillo's social arbitrage methodology.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 32px", borderBottom: "1px solid #111" }}>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          <StatPill label="TRENDS TRACKED" value={trends.length} />
          <StatPill label="PLATFORMS" value={PLATFORMS.length} color="#ffd700" />
          <StatPill label="HIGH CONVICTION" value={2} color="#00ff9d" />
          <StatPill label="TICKERS FLAGGED" value="14" color="#e1306c" />
        </div>
      </div>

      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111", display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {["ALL", ...PLATFORMS].map(p => (
          <button key={p} onClick={() => setFilter(p)} style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em",
            padding: "6px 14px", background: filter === p ? "#00ff9d" : "transparent",
            color: filter === p ? "#000" : "#444", border: `1px solid ${filter === p ? "#00ff9d" : "#1e1e1e"}`,
            cursor: "pointer", borderRadius: "2px", transition: "all 0.15s",
          }}>{p}</button>
        ))}
      </div>

      <div style={{ padding: "2px 32px 60px", maxWidth: "1100px" }}>
        <div style={{ padding: "16px 0 12px", color: "#333", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
          SHOWING {filtered.length} TRENDS — CLICK "ANALYZE" TO RUN AI SOCIAL ARB ANALYSIS
        </div>
        {filtered.map((trend, i) => (
          <div key={i} style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
            <TrendCard trend={trend} index={i} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ color: "#2a2a2a", fontSize: "0.65rem", letterSpacing: "0.1em" }}>NOT FINANCIAL ADVICE · FOR EDUCATIONAL PURPOSES ONLY</span>
        <span style={{ color: "#2a2a2a", fontSize: "0.65rem", letterSpacing: "0.1em" }}>SOCIAL ARB SCANNER · OPEN SOURCE · PUBLIC ACCESS</span>
      </div>
    </div>
  );
}