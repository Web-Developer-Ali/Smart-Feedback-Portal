import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

declare global {
  // Prevent re-creating the pool across hot reloads in dev
  var _pgPool: Pool | undefined;
}

const pool =
  global._pgPool ||
  new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 5, // 👈 smaller pool for serverless
    idleTimeoutMillis: 10000, // lower idle timeout
    connectionTimeoutMillis: 10000, // 10s connection timeout
  });

if (process.env.NODE_ENV !== "production") global._pgPool = pool;

export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
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
