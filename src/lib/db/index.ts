import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 서버리스(Vercel) 환경에서 연결 풀이 매 요청마다 늘어나지 않도록 전역에 캐시.
const globalForDb = globalThis as unknown as { __pool?: Pool };

const pool =
  globalForDb.__pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase Transaction Pooler(6543) 사용 시 짧은 연결에 맞춰 최소로.
    max: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pool = pool;
}

export const db = drizzle(pool, { schema });
export * from "./schema";
