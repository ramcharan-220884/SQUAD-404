import { pool } from "../config/db.js";

export const fetchAllStudents = async ({ page = 1, limit = 1000 }) => {
  const offset = (page - 1) * limit;
  const [students] = await pool.query(`
    SELECT 
      s.id, s.name, s.email, s.branch, s.cgpa, s.placed_status, s.created_at, s.status,
      COUNT(a.id) as applicationsCount,
      SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) as selectedCount
    FROM students s
    LEFT JOIN applications a ON s.id = a.student_id
    WHERE s.status != 'Rejected'
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `, [Number(limit), Number(offset)]);
  const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM students");
  return { students, total };
};

export const updateStudentById = async (id, { name, email, branch, cgpa, status, placed_status }) => {
  await pool.query(
    `UPDATE students SET name = ?, email = ?, branch = ?, cgpa = ?, status = ?, placed_status = ? WHERE id = ?`,
    [name, email, branch, cgpa, status, placed_status, id]
  );
};

export const updatePlacementStatusById = async (studentId, status) => {
  await pool.query("UPDATE students SET placed_status = ? WHERE id = ?", [status, studentId]);
};

export const fetchAllUsers = async () => {
  const [students] = await pool.query("SELECT id, name, email, 'student' as role, created_at FROM students");
  const [companies] = await pool.query("SELECT id, name, email, 'company' as role, created_at FROM companies");
  return [...students, ...companies];
};

export const fetchPendingUsers = async () => {
  const [students] = await pool.query(
    "SELECT id, name, email, 'student' as type, created_at FROM students WHERE status = 'Pending'"
  );
  const [companies] = await pool.query(
    "SELECT id, name, email, 'company' as type, created_at FROM companies WHERE status = 'Pending'"
  );
  return [...students, ...companies];
};

export const approveUserById = async (id, type) => {
  const table = type === "student" ? "students" : "companies";
  await pool.query(`UPDATE ${table} SET status = 'Active', approved = 1 WHERE id = ?`, [id]);
};

export const rejectUserById = async (id, type) => {
  const table = type === "student" ? "students" : "companies";
  await pool.query(`UPDATE ${table} SET status = 'Rejected' WHERE id = ?`, [id]);
};

export const fetchDashboardStats = async () => {
  const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM students WHERE status = 'Active'");
  const [[{ activeCompanies }]] = await pool.query("SELECT COUNT(*) as activeCompanies FROM companies WHERE status = 'Active'");
  const [[{ totalApplications }]] = await pool.query("SELECT COUNT(*) as totalApplications FROM applications");
  const [[{ totalJobs }]] = await pool.query("SELECT COUNT(*) as totalJobs FROM jobs");
  const [[{ pendingStudents }]] = await pool.query("SELECT COUNT(*) as pendingStudents FROM students WHERE status = 'Pending'");
  const [[{ pendingCompanies }]] = await pool.query("SELECT COUNT(*) as pendingCompanies FROM companies WHERE status = 'Pending'");
  return { totalStudents, activeCompanies, totalApplications, totalJobs, pendingApprovals: pendingStudents + pendingCompanies };
};
