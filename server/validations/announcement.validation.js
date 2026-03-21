import Joi from 'joi';

export const createAnnouncementSchema = {
  body: Joi.object({
    title: Joi.string().min(5).max(150).required(),
    content: Joi.string().min(10).max(5000).required(),
    category: Joi.string().valid('General', 'Placement', 'Event', 'Alert').default('General'),
    audience: Joi.string().valid('All', 'All Students', 'All Companies', 'Specific Branch').default('All'),
    target_branch: Joi.string().optional().allow('')
  })
};

export const updateAnnouncementSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    title: Joi.string().min(5).max(150).optional(),
    content: Joi.string().min(10).max(5000).optional(),
    category: Joi.string().valid('General', 'Placement', 'Event', 'Alert').optional(),
    audience: Joi.string().valid('All', 'All Students', 'All Companies', 'Specific Branch').optional(),
    target_branch: Joi.string().optional().allow('')
  }).min(1)
};
