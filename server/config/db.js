import mysql from "mysql2";
import fs from "fs";
import "./env.js";

// SSL Configuration for Aiven Cloud MySQL
// Enforces encrypted connections. Validates the certificate chain ONLY if a custom CA is provided.
const sslConfig = {
  // If the CA cert file doesn't exist locally, we must set this to false to allow the self-signed Aiven cert
  rejectUnauthorized: !!(process.env.DB_CA_CERT && fs.existsSync(process.env.DB_CA_CERT)),
};

// If an Aiven CA certificate is provided via DB_CA_CERT, load it.
if (process.env.DB_CA_CERT && fs.existsSync(process.env.DB_CA_CERT)) {
  sslConfig.ca = fs.readFileSync(process.env.DB_CA_CERT);
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();
