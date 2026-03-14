import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Register new company
export const registerCompany = async (req, res, next) => {
  const { name, email, password, description } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT * FROM companies WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into DB with approved = false
    const [result] = await pool.query(
      `INSERT INTO companies (name, email, password_hash, description, approved) VALUES (?, ?, ?, ?, false)`,
      [name, email, hash, description]
    );

    res
      .status(201)
      .json({ message: "Company registered successfully, pending approval", companyId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Login company
export const loginCompany = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM companies WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const company = rows[0];
    const match = await bcrypt.compare(password, company.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Use /api/auth/login for token-based authentication", companyId: company.company_id, name: company.name });
  } catch (err) {
    next(err);
  }
};