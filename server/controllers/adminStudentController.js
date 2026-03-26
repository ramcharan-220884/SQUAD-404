import * as studentService from "../services/adminStudentService.js";

export const getStats = async (req, res, next) => {
  try {
    const data = await studentService.fetchDashboardStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getUsers = async (req, res, next) => {
  try {
    const data = await studentService.fetchAllUsers();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getPendingUsers = async (req, res, next) => {
  try {
    const data = await studentService.fetchPendingUsers();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const approveUser = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    await studentService.approveUserById(id, type);
    res.json({ success: true, message: `${type} approved successfully` });
  } catch (err) { next(err); }
};

export const rejectUser = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    await studentService.rejectUserById(id, type);
    res.json({ success: true, message: `${type} rejection processed` });
  } catch (err) { next(err); }
};

export const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, status, company } = req.query;
    const { students, total } = await studentService.fetchAllStudents({ 
      page, 
      limit, 
      applicationStatus: status,
      companyName: company
    });
    res.json({ success: true, data: students, pagination: { total, page: parseInt(page) || 1, limit: parseInt(limit) || 1000 } });
  } catch (err) { next(err); }
};

export const getStudentById = async (req, res, next) => {
  try {
    const data = await studentService.fetchStudentById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateStudentAdmin = async (req, res, next) => {
  try {
    await studentService.updateStudentById(req.params.id, req.body);
    res.json({ success: true, message: "Student updated successfully" });
  } catch (err) { next(err); }
};

export const updatePlacementStatus = async (req, res, next) => {
  try {
    const { studentId, status } = req.body;
    await studentService.updatePlacementStatusById(studentId, status);
    res.json({ success: true, message: "Placement status updated" });
  } catch (err) { next(err); }
};
