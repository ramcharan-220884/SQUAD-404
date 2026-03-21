import Joi from 'joi';

export const postJobSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().min(10).required(),
    department: Joi.string().required(),
    deadline: Joi.date().iso().required(),
    status: Joi.string().optional(),
    location: Joi.string().optional().allow(''),
    type: Joi.string().valid('Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance').default('Full-time'),
    ctc: Joi.string().required(),
    skills: Joi.string().optional().allow(''),
    experience: Joi.string().optional().allow(''),
    min_cgpa: Joi.number().min(0).max(10).optional().allow(null),
    max_backlogs: Joi.number().optional().allow(null),
    eligible_branches: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional().allow(null)
  }).unknown(true)
};
