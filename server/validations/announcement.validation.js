import Joi from 'joi';

export const createAnnouncementSchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(150).required(),
    content: Joi.string().min(1).max(5000).required(),
    category: Joi.string().valid('General', 'Notice', 'Placement', 'Event', 'Alert').default('Notice'),
    audience: Joi.string().valid('All', 'All Students', 'All Companies', 'Final Year', 'Recruiters', 'Specific Branch').default('All Students'),
    start_date: Joi.string().optional().allow('', null),
    expiry_date: Joi.string().optional().allow('', null),
    is_pinned: Joi.boolean().optional(),
    target_branch: Joi.string().optional().allow('')
  }).unknown(true)
};

export const updateAnnouncementSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(150).optional(),
    content: Joi.string().min(1).max(5000).optional(),
    category: Joi.string().valid('General', 'Notice', 'Placement', 'Event', 'Alert').optional(),
    audience: Joi.string().valid('All', 'All Students', 'All Companies', 'Final Year', 'Recruiters', 'Specific Branch').optional(),
    start_date: Joi.string().optional().allow('', null),
    expiry_date: Joi.string().optional().allow('', null),
    is_pinned: Joi.boolean().optional(),
    target_branch: Joi.string().optional().allow('')
  }).min(1).unknown(true)
};
