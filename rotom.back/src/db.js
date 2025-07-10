import pg from "pg";
import "dotenv/config";

const Pool = pg.Pool;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default pool;