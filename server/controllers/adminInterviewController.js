import * as interviewService from "../services/adminInterviewService.js";

export const getAdminInterviews = async (req, res, next) => {
  try {
    const data = await interviewService.fetchAllInterviews();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createInterview = async (req, res, next) => {
  try {
    const id = await interviewService.createInterviewRecord(req.body);
    res.json({ success: true, message: "Interview scheduled successfully", data: { id, ...req.body } });
  } catch (err) { next(err); }
};

export const updateInterview = async (req, res, next) => {
  try {
    await interviewService.updateInterviewById(req.params.id, req.body);
    res.json({ success: true, message: "Interview updated successfully" });
  } catch (err) { next(err); }
};

export const deleteInterview = async (req, res, next) => {
  try {
    await interviewService.deleteInterviewById(req.params.id);
    res.json({ success: true, message: "Interview deleted successfully" });
  } catch (err) { next(err); }
};
