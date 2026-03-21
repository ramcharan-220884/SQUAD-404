import * as analyticsService from "../services/analyticsService.js";

export const getPlacementAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.fetchPlacementAnalytics();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
