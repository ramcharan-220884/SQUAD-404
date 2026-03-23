import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import responseHandler from "./middleware/responseHandler.js";
import errorHandler from "./middleware/errorHandler.js";

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(responseHandler);

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  // Authentication & Room Joining
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { role, id } = decoded;
      
      if (role === 'admin') {
        socket.join("admins");
        console.log(`Socket ${socket.id} joined admins room`);
      } else if (role === 'student') {
        socket.join("students");
        socket.join(`student_${id}`);
        console.log(`Socket ${socket.id} joined students and student_${id} room`);
      } else if (role === 'company') {
        socket.join("companies");
        socket.join(`company_${id}`);
        console.log(`Socket ${socket.id} joined companies and company_${id} room`);
      }
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      socket.disconnect(true);
      return;
    }
  } else {
    // If no token is provided at all, disconnect
    console.warn("Socket connected without token. Disconnecting...");
    socket.disconnect(true);
    return;
  }

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Export io for controllers
export { io };

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/features", featureRoutes);

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

// Cleanup expired password reset tokens every hour
// Retry once on ECONNRESET — happens when the Aiven pool connection is stale after idle time
async function cleanupExpiredTokens() {
  try {
    await pool.query("DELETE FROM password_resets WHERE expires_at < NOW()");
  } catch (err) {
    if (err.code === "ECONNRESET" || err.code === "PROTOCOL_CONNECTION_LOST") {
      await new Promise(res => setTimeout(res, 2000));
      try { await pool.query("DELETE FROM password_resets WHERE expires_at < NOW()"); } catch (_) {}
    } else {
      console.error("Token cleanup error:", err.message);
    }
  }
}

setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Run once on startup
pool.query("DELETE FROM password_resets WHERE expires_at < NOW()").catch(() => {});

// Express Error Handling Middleware
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});