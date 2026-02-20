// import { Pool, PoolClient } from "pg";

// declare global {
//   var _pgPool: Pool | undefined;
// }

// // Decode CA from environment
// const caCert = process.env.RDS_CA_BUNDLE
//   ? Buffer.from(process.env.RDS_CA_BUNDLE, "base64").toString("utf8")
//   : undefined;

// const pool =
//   global._pgPool ||
//   new Pool({
//     host: process.env.PGHOST,
//     port: Number(process.env.PGPORT),
//     database: process.env.PGDATABASE,
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//      ssl: {
//       ca: caCert,
//       rejectUnauthorized: true,
//     },
//     // ssl: false,
//     max: 5,
//     idleTimeoutMillis: 10000,
//     connectionTimeoutMillis: 10000,
//   });

// if (process.env.NODE_ENV !== "production") {
//   global._pgPool = pool;
// }

// export async function query(text: string, params?: unknown[]) {
//   return pool.query(text, params);
// }

// export async function withTransaction(callback: (client: PoolClient) => Promise<unknown>) {
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









import { Pool, PoolClient } from "pg";

declare global {
  var _pgPool: Pool | undefined;
}

// Use connection string from environment variable
const connectionString = process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  // Don't throw in development if you're using local PostgreSQL
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production");
  }
}

// Neon requires SSL
const pool =
  global._pgPool ||
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true,
    },
    // Neon connection pool settings
    max: 10,
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    
    // Neon specific: enable keep-alive
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

// Event listeners for connection debugging
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
  // Don't exit the process, just log
});

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', { text, error });
    throw error;
  }
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