import { Tool } from "@langchain/core/tools";

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// 1) Open-Meteo weather (no API key)
export class OpenMeteoWeatherTool extends Tool {
  name = "open_meteo_weather";
  description =
    "Get current weather for a place. Input should be a city name like 'Hyderabad' or 'Paris'. Returns temperature (°C), humidity (%), wind (m/s), and a short summary.";

  async _call(input: string): Promise<string> {
    try {
      const q = encodeURIComponent(input.trim());
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`,
      );
      const geo = await geoRes.json();
      const loc = geo?.results?.[0];
      if (!loc) return `No location found for ${input}.`;
      const { latitude, longitude, name, country, timezone } = loc;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${encodeURIComponent(
          timezone,
        )}`,
      );
      const w = await weatherRes.json();
      const c = w?.current ?? {};
      return `Location: ${name}, ${country} (tz: ${timezone})\nTemperature: ${c.temperature_2m} °C\nHumidity: ${c.relative_humidity_2m} %\nWind: ${c.wind_speed_10m} m/s\nWeatherCode: ${c.weather_code}`;
    } catch (e) {
      return `Weather lookup failed: ${formatError(e)}`;
    }
  }
}

// 2) World time using worldtimeapi.org (no API key)
export class WorldTimeTool extends Tool {
  name = "world_time";
  description =
    "Get the current local time for a city. Input should be a city name like 'Hyderabad' or 'Tokyo'.";

  async _call(input: string): Promise<string> {
    try {
      const q = encodeURIComponent(input.trim());
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`,
      );
      const geo = await geoRes.json();
      const loc = geo?.results?.[0];
      if (!loc) return `No location found for ${input}.`;
      const tz = loc.timezone as string;
      const timeRes = await fetch(
        `https://worldtimeapi.org/api/timezone/${encodeURIComponent(tz)}`,
      );
      const t = await timeRes.json();
      return `Local time in ${loc.name}, ${loc.country} (${tz}): ${t.datetime}`;
    } catch (e) {
      return `Time lookup failed: ${formatError(e)}`;
    }
  }
}

// 3) Currency conversion using exchangerate.host (no API key)
export class ExchangeRateTool extends Tool {
  name = "fx_convert";
  description =
    "Convert currency. Input formats: 'USD to INR', '100 USD to EUR'. Returns converted amount.";

  async _call(input: string): Promise<string> {
    try {
      const m = input.trim().match(/^(?:(\d+(?:\.\d+)?)\s+)?([A-Za-z]{3})\s+to\s+([A-Za-z]{3})$/i);
      if (!m) return "Invalid format. Try '100 USD to EUR' or 'USD to INR'.";
      const amount = parseFloat(m[1] ?? "1");
      const from = m[2].toUpperCase();
      const to = m[3].toUpperCase();
      const res = await fetch(
        `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`,
      );
      const j = await res.json();
      if (!j?.result) return "Conversion failed.";
      return `${amount} ${from} = ${j.result} ${to}`;
    } catch (e) {
      return `FX conversion failed: ${formatError(e)}`;
    }
  }
}

// 4) Crypto price using CoinGecko (no key required for simple endpoint; optional key supported)
export class CryptoPriceTool extends Tool {
  name = "crypto_price";
  description =
    "Get crypto price. Input 'bitcoin usd' or 'ethereum eur'. Uses CoinGecko simple price API.";

  constructor(private apiKey?: string) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const [coinRaw, vsRaw] = input.trim().split(/\s+/);
      if (!coinRaw || !vsRaw) return "Format: '<coin> <fiat>', e.g., 'bitcoin usd'.";
      const coin = coinRaw.toLowerCase();
      const vs = vsRaw.toLowerCase();
      const headers: Record<string, string> = {};
      if (this.apiKey) headers["x-cg-demo-api-key"] = this.apiKey;
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          coin,
        )}&vs_currencies=${encodeURIComponent(vs)}`,
        { headers },
      );
      const j = await res.json();
      const price = j?.[coin]?.[vs];
      if (price == null) return "Price not available.";
      return `${coin} = ${price} ${vs}`;
    } catch (e) {
      return `Crypto lookup failed: ${formatError(e)}`;
    }
  }
}

// 5) arXiv search
export class ArxivSearchTool extends Tool {
  name = "arxiv_search";
  description =
    "Search arXiv for academic papers. Input should be a query string; returns top 3 results with titles and links.";

  async _call(input: string): Promise<string> {
    try {
      const q = encodeURIComponent(input.trim());
      const res = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${q}&start=0&max_results=3`,
      );
      const text = await res.text();
      // Naive parse for titles and links
      const items: string[] = [];
      const entryRegex = /<entry>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<id>([\s\S]*?)<\/id>[\s\S]*?<\/entry>/g;
      let m: RegExpExecArray | null;
      while ((m = entryRegex.exec(text)) && items.length < 3) {
        const title = m[1].replace(/\s+/g, " ").trim();
        const link = m[2].trim();
        items.push(`- ${title}\n  ${link}`);
      }
      if (!items.length) return "No results";
      return `Top arXiv results:\n${items.join("\n")}`;
    } catch (e) {
      return `arXiv search failed: ${formatError(e)}`;
    }
  }
}

// 6) Hacker News search
export class HackerNewsSearchTool extends Tool {
  name = "hn_search";
  description =
    "Search Hacker News via Algolia. Input should be a query string. Returns top stories with titles and URLs.";

  async _call(input: string): Promise<string> {
    try {
      const q = encodeURIComponent(input.trim());
      const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${q}`);
      const j = await res.json();
      const hits = (j?.hits ?? []).slice(0, 5);
      if (!hits.length) return "No results";
      return hits
        .map((h: any, i: number) => `${i + 1}. ${h.title}\n   ${h.url || h.story_url}`)
        .join("\n");
    } catch (e) {
      return `HN search failed: ${formatError(e)}`;
    }
  }
}


