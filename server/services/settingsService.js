import { pool } from "../config/db.js";

export const fetchSettings = async () => {
  const [rows] = await pool.query("SELECT * FROM admin_settings WHERE id = 1");
  if (rows.length === 0) return {};
  const data = rows[0];
  try { data.notifications = typeof data.notifications === 'string' ? JSON.parse(data.notifications) : data.notifications; } catch (e) {}
  try { data.permissions = typeof data.permissions === 'string' ? JSON.parse(data.permissions) : data.permissions; } catch (e) {}
  return data;
};

export const saveSettings = async (adminId, {
  systemName, collegeName, adminEmail, contactNumber,
  academicYear, semester, placementSeason, darkMode,
  notifications, permissions, sessionTimeout, twoFactorEnabled
}) => {
  await pool.query(
    `UPDATE admin_settings SET 
      system_name = ?, college_name = ?, admin_email = ?, contact_number = ?, 
      academic_year = ?, semester = ?, placement_season = ?, dark_mode = ?, 
      notifications = ?, permissions = ?, session_timeout = ?, two_factor_enabled = ?
     WHERE id = 1`,
    [
      systemName, collegeName, adminEmail, contactNumber,
      academicYear, semester, placementSeason, darkMode ? 1 : 0,
      notifications ? JSON.stringify(notifications) : null,
      permissions ? JSON.stringify(permissions) : null,
      sessionTimeout || 30, twoFactorEnabled ? 1 : 0
    ]
  );
  await pool.query("UPDATE admins SET dark_mode = ? WHERE id = ?", [darkMode ? 1 : 0, adminId]);
};

export const fetchAdminProfile = async (id) => {
  const [rows] = await pool.query("SELECT id, name, email, dark_mode FROM admins WHERE id = ?", [id]);
  return rows[0] || null;
};

export const saveAdminProfile = async (id, { name, email, dark_mode }) => {
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (email !== undefined) { fields.push("email = ?"); params.push(email); }
  if (dark_mode !== undefined) { fields.push("dark_mode = ?"); params.push(dark_mode); }
  if (fields.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`, params);
};

export const verifyAndChangePassword = async (id, currentPassword, newPassword) => {
  const { pool: db } = await import("../config/db.js");
  const { default: bcrypt } = await import("bcrypt");
  const [[admin]] = await db.query("SELECT password FROM admins WHERE id = ?", [id]);
  if (!admin) throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) throw Object.assign(new Error("Incorrect current password"), { statusCode: 400 });
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE admins SET password = ? WHERE id = ?", [hashed, id]);
};
