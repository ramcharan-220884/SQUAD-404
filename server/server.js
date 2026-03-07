import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// Test database connection
async function testDB() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testDB();

// Test API
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students LIMIT 5");
    res.json(rows);
  } catch (err) {
    res.status(500).send("Database connection failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});