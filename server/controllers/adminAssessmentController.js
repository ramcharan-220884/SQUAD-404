import * as assessmentService from "../services/assessmentService.js";

export const getAdminAssessments = async (req, res, next) => {
  try {
    const data = await assessmentService.fetchAllAssessments();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getAssessmentAttempts = async (req, res, next) => {
  try {
    const assessment_id = parseInt(req.params.id, 10);
    if (isNaN(assessment_id)) {
      return res.status(400).json({ success: false, message: "Invalid assessment ID" });
    }
    const { page, limit, evaluation_status, search } = req.query;
    const { attempts, total, page: pg, limit: lim } = await assessmentService.fetchAssessmentAttempts(
      assessment_id, { page, limit, evaluation_status, search }
    );
    res.json({
      success: true,
      data: attempts,
      pagination: { total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) }
    });
  } catch (err) { next(err); }
};

export const createAssessment = async (req, res, next) => {
  try {
    await assessmentService.createAssessmentRecord(req.body);
    res.json({ success: true, message: "Assessment created successfully" });
  } catch (err) { next(err); }
};

export const updateAssessment = async (req, res, next) => {
  try {
    await assessmentService.updateAssessmentById(req.params.id, req.body);
    res.json({ success: true, message: "Assessment updated successfully" });
  } catch (err) { next(err); }
};

export const deleteAssessment = async (req, res, next) => {
  try {
    await assessmentService.deleteAssessmentById(req.params.id);
    res.json({ success: true, message: "Assessment deleted successfully" });
  } catch (err) { next(err); }
};
