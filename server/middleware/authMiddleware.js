import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";
import { pool } from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  // Dual-Token System: Access tokens are exclusively provided via Headers
  const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) {
    if (res.sendError) return res.sendError("Access denied. No access token provided.", 401);
    return res.status(401).json({ success: false, message: "Access denied. No access token provided." });
  }

  try {
    // Graceful Redis check — skip if Redis is disconnected
    if (redisClient?.status === "ready") {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        if (res.sendError) return res.sendError("Invalid token (Logged out).", 401);
        return res.status(401).json({ success: false, message: "Invalid token (Logged out)." });
      }
    }
  } catch (err) {
    console.warn("Redis check failed, proceeding safely:", err.message);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let tableName = "";
    if (decoded.role === "student") tableName = "students";
    else if (decoded.role === "company") tableName = "companies";
    else if (decoded.role === "admin") tableName = "admins";

    if (tableName) {
      const selectFields = decoded.role === "admin" ? "id" : "status, approved";
      const [users] = await pool.query(`SELECT ${selectFields} FROM ${tableName} WHERE id = ?`, [decoded.id]);
      if (users.length === 0) return res.status(401).json({ success: false, message: "User not found." });
      
      const dbUser = users[0];
      if (decoded.role !== "admin") {
        if (dbUser.status === "Rejected") return res.status(403).json({ success: false, message: "Account rejected. Please contact support." });
        if (dbUser.status === "Pending" || dbUser.approved === 0 || dbUser.approved === false) {
          return res.status(403).json({ success: false, message: "Your account is pending admin approval" });
        }
      }
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (res.sendError) return res.sendError("Invalid or expired token.", 401);
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toString().trim().toLowerCase();
    const reqRole = requiredRole.toString().trim().toLowerCase();
    
    if (!req.user || userRole !== reqRole) {
      if (res.sendError) return res.sendError(`Access denied. ${requiredRole} role required.`, 403);
      return res.status(403).json({ success: false, message: `Access denied. ${requiredRole} role required.` });
    }
    next();
  };
};
