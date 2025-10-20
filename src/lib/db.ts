import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// 🧩 Create a single global connection pool (works across hot reloads in Next.js)
let globalPool: Pool | undefined;

const pool =
  globalPool ??
  new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false, // ✅ Always use SSL for AWS RDS / Vercel
    },
    max: 10, // Limit open connections
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 10000, // Timeout if no connection after 10s
  });

// Prevent creating multiple pools in dev hot reload
if (process.env.NODE_ENV !== "production") {
  globalPool = pool;
}

// ✅ Query helper (connect, execute, release)
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

// ✅ Transaction helper (BEGIN → COMMIT/ROLLBACK)
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export { pool };

// import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// const isLocal =
//   process.env.PGHOST === "localhost" || process.env.PGHOST === "127.0.0.1";

// const pool = new Pool({
//   host: process.env.PGHOST,
//   port: Number(process.env.PGPORT),
//   database: process.env.PGDATABASE,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   ssl: isLocal ? false : { rejectUnauthorized: false },
// });

// export async function query<T extends QueryResultRow = Record<string, unknown>>(
//   text: string,
//   params?: unknown[]
// ): Promise<QueryResult<T>> {
//   const client = await pool.connect();
//   try {
//     return await client.query<T>(text, params);
//   } finally {
//     client.release();
//   }
// }

// export async function withTransaction<T>(
//   callback: (client: PoolClient) => Promise<T>
// ): Promise<T> {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const result = await callback(client);
//     await client.query("COMMIT");
//     return result;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// export { pool };
