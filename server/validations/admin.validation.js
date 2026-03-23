import Joi from 'joi';

export const approveUserSchema = {
  body: Joi.object({
    id: Joi.number().integer().positive().required(),
    type: Joi.string().valid('student', 'company').required()
  })
};

export const rejectUserSchema = {
  body: Joi.object({
    id: Joi.number().integer().positive().required(),
    type: Joi.string().valid('student', 'company').required()
  })
};

export const updateStudentAdminSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Pending', 'Rejected', 'Alumni').optional(),
    cgpa: Joi.alternatives().try(Joi.number().min(0).max(10), Joi.string().allow('')).optional(),
    branch: Joi.string().optional().allow('')
  })
};

export const updateCompanyAdminSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    status: Joi.string().valid('Active', 'Pending', 'Rejected').optional(),
    package: Joi.string().optional().allow(''),
    deadline: Joi.date().iso().optional().allow(null)
  })
};

export const ticketStatusSchema = {
  body: Joi.object({
    id: Joi.number().integer().positive().required(),
    status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed').required()
  })
};

export const settingsSchema = {
  body: Joi.object({
    academicYear: Joi.string().optional(),
    registrationOpen: Joi.boolean().optional(),
    contactEmail: Joi.string().email().optional(),
    theme: Joi.string().valid('light', 'dark', 'system').optional()
  }).min(1)
};

export const adminProfileSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional()
  }).min(1)
};

export const changeAdminPasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  })
};

export const createEventSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().optional().allow(''),
    date: Joi.date().iso().required(),
    type: Joi.string().optional(),
    status: Joi.string().valid('Upcoming', 'Ongoing', 'Completed').default('Upcoming')
  }).unknown(true)
};

export const createCompetitionSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().optional().allow(''),
    deadline: Joi.date().iso().required(),
    prize: Joi.string().optional().allow(''),
    status: Joi.string().valid('Open', 'Closed').default('Open')
  }).unknown(true)
};

export const createAssessmentSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().optional().allow(''),
    deadline: Joi.date().iso().required(),
    duration: Joi.number().integer().positive().required(),
    status: Joi.string().valid('Active', 'Inactive').default('Active')
  }).unknown(true)
};

export const createInterviewSchema = {
  body: Joi.object({
    role: Joi.string().required(),
    round: Joi.string().required(),
    date: Joi.date().iso().required(),
    company_id: Joi.number().integer().positive().optional()
  }).unknown(true)
};

export const notifyCandidatesSchema = {
  body: Joi.object({
    candidateIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    type: Joi.string().valid('orientation', 'interview').required(),
    details: Joi.object().required()
  })
};
