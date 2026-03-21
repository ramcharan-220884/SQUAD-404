import { pool } from "../config/db.js";

export const fetchTickets = async ({ priority, status }) => {
  let query = "SELECT * FROM support_tickets WHERE 1=1";
  const params = [];
  if (priority) { query += " AND priority = ?"; params.push(priority); }
  if (status) { query += " AND status = ?"; params.push(status); }
  const [tickets] = await pool.query(query, params);
  return tickets;
};

export const updateTicketStatusById = async (id, status) => {
  const [[ticket]] = await pool.query("SELECT reporter_id, title FROM support_tickets WHERE id = ?", [id]);
  await pool.query("UPDATE support_tickets SET status = ? WHERE id = ?", [status, id]);
  return ticket; // returned so controller can emit socket event
};
