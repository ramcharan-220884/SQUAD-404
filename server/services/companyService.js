import { pool } from "../config/db.js";

export const fetchAllCompanies = async ({ page = 1, limit = 1000 }) => {
  const offset = (page - 1) * limit;
  const [companies] = await pool.query(`
    SELECT 
      c.id, c.name, c.email, c.role, c.package, c.deadline, c.created_at, c.status,
      (SELECT COUNT(*) FROM jobs WHERE company_id = c.id) as totalJobs,
      (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = c.id) as totalApplications,
      (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = c.id AND a.status = 'Selected') as studentsSelected
    FROM companies c
    WHERE c.status != 'Rejected'
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `, [Number(limit), Number(offset)]);
  const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM companies");
  return { companies, total };
};

export const updateCompanyById = async (id, { name, email, status, package: pkg, deadline }) => {
  await pool.query(
    `UPDATE companies SET name = ?, email = ?, status = ?, package = ?, deadline = ? WHERE id = ?`,
    [name, email, status, pkg, deadline, id]
  );
};
