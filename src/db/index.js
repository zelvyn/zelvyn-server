import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
console.log("Using connection string:", process.env.DATABASE_URL);

// Add connection config with more options
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection with async/await for better error handling
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log(
      "Successfully connected to PostgreSQL database",
      result.rows[0]
    );
    client.release();
  } catch (err) {
    console.error("Database connection error:", {
      message: err.message,
      stack: err.stack,
      details: err.detail,
      hint: "Check your DATABASE_URL and make sure Neon database is accessible",
    });
  }
};

testConnection();

// Helper function for running queries
export const query = (text, params) => pool.query(text, params);

export default pool;
