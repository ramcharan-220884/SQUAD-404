import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool } from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

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

// Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const status = err.status || 500;
  res.status(status).json({ 
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});