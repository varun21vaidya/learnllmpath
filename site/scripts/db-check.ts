import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf-8");
const url = env.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/)?.[1];
if (!url) {
  console.log("NO DATABASE_URL in .env.local");
  process.exit(0);
}
console.log("url found, host:", new URL(url.trim()).host);
const sql = postgres(url.trim(), { max: 1, connect_timeout: 8 });
async function probe(label: string, q: () => Promise<unknown>) {
  try {
    await q();
    console.log(label + ": OK");
  } catch (e) {
    console.log(label + " ERR: " + String((e as Error).message).slice(0, 140));
  }
}
async function main() {
  await probe("users.is_public", () => sql`select count(*) from users where is_public = true`);
  await probe("resource_votes", () => sql`select 1 from resource_votes limit 1`);
  await probe("srs_cards", () => sql`select 1 from srs_cards limit 1`);
  await sql.end();
}
main();
