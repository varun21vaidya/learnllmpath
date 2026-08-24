import postgres from "postgres";
import { readFileSync } from "node:fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/)?.[1]?.trim();
if (!url) {
  console.log("NO DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url, { max: 1 });

async function main() {
  const rows = await sql`
    select id, email, name, handle, is_public, created_at
    from users order by created_at desc limit 10
  `;
  console.log(`users in db: ${rows.length}`);
  for (const r of rows) {
    console.log(
      `- handle=${JSON.stringify(r.handle)} is_public=${r.is_public} name=${JSON.stringify(r.name)} email=${r.email}`
    );
  }

  const target = await sql`
    select id, handle, is_public from users where lower(handle) = lower(${"awosome-guy"})
  `;
  console.log(`exact query for 'awosome-guy': ${target.length} row(s)`);

  const publicRows = await sql`
    select handle from users where is_public = true and handle is not null
  `;
  console.log(`public-with-handle rows (leaderboard/profile eligible): ${publicRows.length}`);

  await sql.end();
}

main();
