import axios from "axios";
import * as cheerio from "cheerio";

export async function crawlWebsite(startUrl: string, maxPages = 50) {
  const visited = new Set<string>();
  const pages: { url: string; text: string }[] = [];

  async function crawl(url: string) {
    if (visited.size >= maxPages || visited.has(url)) return;
    visited.add(url);

    try {
      const res = await axios.get(url, { timeout: 10000 });
      const parser = cheerio.load(res.data);

      const text = parser("body").text().replace(/\s+/g, " ").trim();
      pages.push({ url, text });

      const base = new URL(startUrl);

      parser("a[href]").each((_, e) => {
        const link = parser(e).attr("href");
        if (!link) return;
        try {
          const absolute = new URL(link, base).toString();
          if (absolute.startsWith(base.origin)) {
            crawl(absolute);
          }
        } catch {}
      });
    } catch (error) {
      console.log("Failed to fetch: ", url, error);
    }
  }

  await crawl(startUrl);
  return pages;
}
