// fetch-briefing.mjs
// Holt Finanzdaten (Alpha Vantage) + News (RSS) und schreibt sie als JSON
// für das Dashboard. Läuft automatisch via GitHub Actions (Mo/Fr).

import Parser from "rss-parser";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
if (!ALPHA_VANTAGE_KEY) {
  console.error("FEHLER: ALPHA_VANTAGE_KEY fehlt (als GitHub Secret setzen).");
  process.exit(1);
}

const RSS_FEEDS = {
  schlagzeilen: "https://www.srf.ch/news/bnf/rss/1646",
  geopolitik: "https://www.reutersagency.com/feed/?best-topics=world",
  schweiz: "https://www.nzz.ch/schweiz.rss",
};

const parser = new Parser({ timeout: 15000 });

async function fetchRss(url, limit = 6) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, limit).map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      pubDate: item.pubDate ?? "",
      summary: (item.contentSnippet ?? item.summary ?? "").slice(0, 280),
    }));
  } catch (err) {
    console.error(`RSS-Fehler bei ${url}:`, err.message);
    return [];
  }
}

async function fetchAlphaVantageNews() {
  const url =
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT` +
    `&topics=financial_markets&limit=12&sort=LATEST&apikey=${ALPHA_VANTAGE_KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.feed) {
      console.error("Alpha Vantage: keine feed-Daten erhalten", json);
      return [];
    }
    return json.feed.slice(0, 10).map((item) => ({
      title: item.title,
      url: item.url,
      source: item.source,
      timePublished: item.time_published,
      sentimentScore: Number(item.overall_sentiment_score),
      sentimentLabel: item.overall_sentiment_label,
      tickers: (item.ticker_sentiment ?? []).slice(0, 3).map((t) => t.ticker),
    }));
  } catch (err) {
    console.error("Alpha Vantage Fehler:", err.message);
    return [];
  }
}

function sentimentToBadge(label) {
  if (!label) return "neutral";
  const l = label.toLowerCase();
  if (l.includes("bearish")) return "negative";
  if (l.includes("bullish")) return "positive";
  return "neutral";
}

async function main() {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const weekday = now.getUTCDay();
  const mode = weekday === 5 ? "rueckblick" : "vorschau";

  console.log(`Baue Briefing (${mode}) fuer ${isoDate}...`);

  const [schlagzeilen, geopolitik, schweiz, finanzNews] = await Promise.all([
    fetchRss(RSS_FEEDS.schlagzeilen),
    fetchRss(RSS_FEEDS.geopolitik),
    fetchRss(RSS_FEEDS.schweiz),
    fetchAlphaVantageNews(),
  ]);

  const finanzNewsMitBadge = finanzNews.map((n) => ({
    ...n,
    badge: sentimentToBadge(n.sentimentLabel),
  }));

  const briefing = {
    generatedAt: now.toISOString(),
    date: isoDate,
    mode,
    sections: {
      schlagzeilen,
      geopolitik,
      schweiz,
      finanzen: finanzNewsMitBadge,
    },
    disclaimer:
      "Keine Anlageberatung - automatisch aus oeffentlich verfuegbaren " +
      "Quellen zusammengestellt (Alpha Vantage, SRF, Reuters, NZZ).",
  };

  const dataDir = path.resolve("data");
  const archiveDir = path.resolve("data", "archive");
  await mkdir(archiveDir, { recursive: true });

  await writeFile(
    path.join(dataDir, "latest.json"),
    JSON.stringify(briefing, null, 2)
  );
  await writeFile(
    path.join(archiveDir, `${isoDate}-${mode}.json`),
    JSON.stringify(briefing, null, 2)
  );

  console.log("Fertig. latest.json + Archiv-Datei geschrieben.");
}

main().catch((err) => {
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});
