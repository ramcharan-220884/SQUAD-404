import { pool } from "../config/db.js";

export const fetchPlacementAnalytics = async () => {
  const [rows] = await pool.query(`
    SELECT 
      YEAR(a.updated_at) as year,
      COUNT(a.id) as placements
    FROM applications a
    WHERE a.status = 'Selected'
    GROUP BY YEAR(a.updated_at)
    ORDER BY year ASC
  `);
  return rows.map(r => ({ ...r, year: String(r.year) }));
};
