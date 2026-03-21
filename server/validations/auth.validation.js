import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('student', 'company', 'admin').required(),
    branch: Joi.string().optional().allow(''),
    cgpa: Joi.alternatives().try(Joi.number().min(0).max(10), Joi.string().allow('')).optional(),
    company_name: Joi.string().optional().allow('')
  })
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('student', 'company', 'admin').required()
  })
};

export const googleLoginSchema = {
  body: Joi.object({
    credential: Joi.string().required(),
    role: Joi.string().valid('student', 'company', 'admin').required()
  })
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().required(),
    role: Joi.string().valid('student', 'company', 'admin').default('student')
  })
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  })
};
