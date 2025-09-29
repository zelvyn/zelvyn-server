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

// Insert a single record
export async function insert(table, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys
      .map((_, i) => `$${i + 1}`)
      .join(", ")}) RETURNING *`;
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting data:", error.message);
    throw error;
  }
}

// Execute a raw query
export async function executeRawQuery(query, params = []) {
  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error executing raw query:", error.message);
    throw error;
  }
}

// Bulk insert
export async function bulkInsert(table, data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data for bulk insert must be a non-empty array");
  }

  try {
    const keys = Object.keys(data[0]);
    const values = data.flatMap(Object.values);
    const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES ${data
      .map(
        (_, i) =>
          `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(", ")})`
      )
      .join(", ")} RETURNING *`;
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error during bulk insert:", error.message);
    throw error;
  }
}

// Update SQL
export async function updateSql(table, data, whereClause, whereParams = []) {
  try {
    if (!whereClause || typeof whereClause !== "string") {
      throw new Error("Invalid whereClause provided");
    }

    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`) // Properly numbering placeholders
      .join(", ");

    // Offset WHERE clause placeholders correctly
    const whereOffset = Object.keys(data).length;
    const adjustedWhereClause = whereClause.replace(
      /\$(\d+)/g,
      (_, num) => `$${parseInt(num) + whereOffset}`
    );

    const query = `UPDATE ${table} SET ${setClause} WHERE ${adjustedWhereClause}`;
    const client = await pool.connect();
    const result = await client.query(query, [
      ...Object.values(data),
      ...whereParams, // Ensuring proper parameter order
    ]);

    client.release();
    return result.rowCount;
  } catch (error) {
    console.error("Error during update:", error.message);
    throw error;
  }
}

// Delete records
export async function deleteSql(table, whereClause, whereParams = []) {
  try {
    if (!whereClause || typeof whereClause !== "string") {
      throw new Error("Invalid whereClause provided");
    }

    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    const client = await pool.connect();
    const result = await client.query(query, whereParams);
    client.release();
    return result.rowCount;
  } catch (error) {
    console.error("Error during delete:", error.message);
    throw error;
  }
}

// Find all records
export async function findAll(table, whereClause = "1=1", whereParams = []) {
  try {
    if (!whereClause || typeof whereClause !== "string") {
      throw new Error("Invalid whereClause provided");
    }

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    const client = await pool.connect();
    const result = await client.query(query, whereParams);
    client.release();
    return result.rows.length > 0 ? result.rows : [];
  } catch (error) {
    console.error("Error during find all:", error.message);
    throw error;
  }
}

export default pool;
