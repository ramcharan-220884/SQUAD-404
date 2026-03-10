import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Register new company
export const registerCompany = async (req, res) => {
  const { name, email, password, description } = req.body;

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

    // Insert into DB
    const [result] = await pool.query(
      `INSERT INTO companies (name, email, password_hash, description, status) VALUES (?, ?, ?, ?, 'Pending')`,
      [name, email, hash, description]
    );

    res
      .status(201)
      .json({ message: "Company registered successfully", companyId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login company
export const loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM companies WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const company = rows[0];
    const match = await bcrypt.compare(password, company.password_hash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // You can add JWT token here later for auth
    res.json({ message: "Login successful", companyId: company.company_id, name: company.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};