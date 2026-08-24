import postgres from "postgres";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const env = readFileSync(".env.local", "utf-8");
const url = env.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/)?.[1];
if (!url) {
  console.log("NO DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url.trim(), { max: 1, connect_timeout: 10 });

const schemaPath = resolve(dirname(process.argv[1] ?? "."), "../schema.sql");
const ddl = readFileSync(schemaPath, "utf-8");

async function main() {
  await sql.unsafe(ddl);
  console.log("schema applied");

  await probe("users.is_public", () => sql`select count(*) from users where is_public = true`);
  await probe("resource_votes", () => sql`select 1 from resource_votes limit 1`);
  await probe("srs_cards", () => sql`select 1 from srs_cards limit 1`);
  await sql.end();
}

async function probe(label: string, q: () => Promise<unknown>) {
  try {
    await q();
    console.log(label + ": OK");
  } catch (e) {
    console.log(label + " ERR: " + String((e as Error).message).slice(0, 140));
    process.exitCode = 1;
  }
}

main();
