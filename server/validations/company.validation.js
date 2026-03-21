import Joi from 'joi';

export const updateCompanyProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(150).optional(),
    phone: Joi.string().optional().allow(''),
    website: Joi.string().uri().optional().allow(''),
    address: Joi.string().optional().allow(''),
    industry: Joi.string().optional().allow('')
  }).min(1)
};

export const updateCompanyApplicationStatusSchema = {
  body: Joi.object({
    applicationId: Joi.number().integer().positive().required(),
    status: Joi.string().valid('Pending', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected').required()
  }).unknown(true)
};
