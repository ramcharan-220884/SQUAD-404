import * as companyService from "../services/companyService.js";

export const getAllCompanies = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { companies, total } = await companyService.fetchAllCompanies({ page, limit });
    res.json({ success: true, data: companies, pagination: { total, page: parseInt(page) || 1, limit: parseInt(limit) || 1000 } });
  } catch (err) { next(err); }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const data = await companyService.fetchCompanyById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateCompanyAdmin = async (req, res, next) => {
  try {
    await companyService.updateCompanyById(req.params.id, req.body);
    res.json({ success: true, message: "Company updated successfully" });
  } catch (err) { next(err); }
};
