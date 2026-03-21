import * as competitionService from "../services/competitionService.js";

export const getAdminCompetitions = async (req, res, next) => {
  try {
    const data = await competitionService.fetchAllCompetitions();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createCompetition = async (req, res, next) => {
  try {
    const data = await competitionService.createCompetitionRecord(req.body);
    res.json({ success: true, message: "Competition created successfully", data });
  } catch (err) { next(err); }
};

export const updateCompetition = async (req, res, next) => {
  try {
    await competitionService.updateCompetitionById(req.params.id, req.body);
    res.json({ success: true, message: "Competition updated successfully" });
  } catch (err) { next(err); }
};

export const deleteCompetition = async (req, res, next) => {
  try {
    await competitionService.deleteCompetitionById(req.params.id);
    res.json({ success: true, message: "Competition deleted successfully" });
  } catch (err) { next(err); }
};
