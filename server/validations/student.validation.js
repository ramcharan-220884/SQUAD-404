import Joi from 'joi';

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    first_name: Joi.string().optional().allow(''),
    last_name: Joi.string().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    cgpa: Joi.alternatives().try(Joi.number().min(0).max(10), Joi.string().allow('')).optional(),
    branch: Joi.string().optional().allow(''),
    github_id: Joi.string().uri().optional().allow(''),
    address: Joi.string().optional().allow(''),
    dob: Joi.date().iso().optional().allow('', null),
    gender: Joi.string().optional().allow(''),
    college: Joi.string().optional().allow(''),
    degree: Joi.string().optional().allow(''),
    skills: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(''),
    projects: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(''),
    internships: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(''),
    profile_photo_url: Joi.string().optional().allow(''),
    resume_url: Joi.string().optional().allow(''),
    profile_completed: Joi.number().valid(0, 1).optional(),
    dark_mode: Joi.number().valid(0, 1).optional(),
    placed_status: Joi.string().optional().allow('')
  }).min(1)
};

export const submitTicketSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().min(10).max(1000).required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Low')
  })
};

export const registerCompetitionEventSchema = {
  body: Joi.object({
    competition_id: Joi.number().integer().positive().optional(),
    event_id: Joi.number().integer().positive().optional()
  })
};

export const updateAssessmentStatusSchema = {
  body: Joi.object({
    assessment_id: Joi.number().integer().positive().required(),
    status: Joi.string().valid('Completed', 'In Progress', 'Failed').required(),
    score: Joi.number().min(0).max(100).optional()
  })
};
