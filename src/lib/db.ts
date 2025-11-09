import { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";

declare global {
  var _pgPool: Pool | undefined;
}

// Read SSL certificate (stored next to this file)
const caCert = fs.readFileSync(
  path.join(process.cwd(), "src/lib/global-bundle.pem")
).toString();

const pool =
  global._pgPool ||
  new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      ca: caCert,
      rejectUnauthorized: true,
    },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export async function withTransaction(callback: (client: PoolClient) => Promise<unknown>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export { pool };