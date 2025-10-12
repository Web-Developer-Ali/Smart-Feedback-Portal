// import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// const pool = new Pool({
//   host: process.env.PGHOST,
//   port: Number(process.env.PGPORT),
//   database: process.env.PGDATABASE,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });

// // Single query helper (auto connect/release)
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

// // Transaction wrapper
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

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const isLocal =
  process.env.PGHOST === "localhost" || process.env.PGHOST === "127.0.0.1";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

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
