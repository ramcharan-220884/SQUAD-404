import { pool } from "../config/db.js";

// Real live data queries
export const getEvents = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

export const getCompetitions = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM competitions ORDER BY deadline ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

export const getInterviews = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM interviews ORDER BY date DESC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

export const getAssessments = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM assessments ORDER BY deadline ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};
