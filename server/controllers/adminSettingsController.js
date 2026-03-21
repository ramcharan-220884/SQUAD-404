import * as settingsService from "../services/settingsService.js";
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

export const getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.fetchSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateSettings = async (req, res, next) => {
  try {
    await settingsService.saveSettings(req.user.id, req.body);
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) { next(err); }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const data = await settingsService.fetchAdminProfile(req.user.id);
    if (!data) return res.status(404).json({ success: false, message: "Admin not found" });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    await settingsService.saveAdminProfile(req.user.id, req.body);
    res.json({ success: true, message: "Profile updated" });
  } catch (err) { next(err); }
};

export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const id = req.user.id;
    const [[admin]] = await pool.query("SELECT password FROM admins WHERE id = ?", [id]);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE admins SET password = ? WHERE id = ?", [hashed, id]);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) { next(err); }
};
