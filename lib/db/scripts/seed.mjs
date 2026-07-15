// One-off seed script: creates the default app_config row and a few
// starter tasks if none exist yet. Safe to re-run.
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(
    `insert into app_config (id) values (1) on conflict (id) do nothing`,
  );

  const { rows } = await client.query(`select count(*)::int as count from tasks`);
  if (rows[0].count === 0) {
    await client.query(
      `insert into tasks (title, description, reward, type, link, is_active) values
        ('Subscribe to our YouTube channel', 'Subscribe and stay for at least 30 seconds', 5, 'youtube', 'https://youtube.com', true),
        ('Follow our Facebook page', 'Follow the page and like the pinned post', 5, 'facebook', 'https://facebook.com', true),
        ('Join our Telegram channel', 'Join the announcement channel for updates', 5, 'telegram', 'https://t.me/', true),
        ('Welcome bonus', 'Claim your one-time welcome bonus', 10, 'join_bonus', null, true)`,
    );
  }

  console.log("Seed complete.");
} finally {
  await client.end();
}
