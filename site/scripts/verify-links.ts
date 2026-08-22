import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ROADMAP } from "../src/data/roadmap";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../link-report.json");

interface Row {
  item: string;
  url: string;
  status: "ok" | "unverified" | "failed";
  http?: number;
}

async function checkUrl(url: string): Promise<{ ok: boolean; http?: number }> {
  const yt = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (yt) {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    return { ok: res.ok, http: res.status };
  }
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok || res.status === 405) {
      res = await fetch(url, { method: "GET", redirect: "follow" });
    }
    return { ok: res.status >= 200 && res.status < 400, http: res.status };
  } catch {
    return { ok: false };
  }
}

async function main() {
  const rows: Row[] = [];
  const seen = new Map<string, boolean>();
  for (const pillar of ROADMAP.pillars) {
    for (const section of pillar.sections) {
      for (const item of section.items) {
        if (!item.url) {
          rows.push({ item: `${item.id} (${item.resourceName})`, url: "", status: "unverified" });
          continue;
        }
        let result = seen.get(item.url);
        if (result === undefined) {
          const r = await checkUrl(item.url);
          result = r.ok || r.http === 403 || r.http === 429 || r.http === 999;
          seen.set(item.url, result);
          await new Promise((r) => setTimeout(r, 300));
        }
        rows.push({ item: item.id, url: item.url, status: result ? "ok" : "failed" });
      }
    }
  }
  const failed = rows.filter((r) => r.status === "failed");
  const unverified = rows.filter((r) => r.status === "unverified");
  console.log(`total=${rows.length} ok=${rows.length - failed.length - unverified.length} failed=${failed.length} unverified=${unverified.length}`);
  if (failed.length > 0) console.log("FAILED:\n" + failed.map((f) => `${f.item} -> ${f.url}`).join("\n"));
  if (unverified.length > 0) console.log("UNVERIFIED:\n" + unverified.map((u) => u.item).join("\n"));
  writeFileSync(OUT, JSON.stringify({ rows }, null, 2), "utf-8");
}

main();
