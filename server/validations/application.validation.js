import Joi from 'joi';

export const applyJobSchema = {
  body: Joi.object({
    job_id: Joi.number().integer().positive().optional()
  }),
  params: Joi.object({
    jobId: Joi.number().integer().positive().optional()
  })
};

export const getJobApplicantsSchema = {
  params: Joi.object({
    job_id: Joi.number().integer().positive().required()
  })
};

export const getStudentApplicationsSchema = {
  params: Joi.object({
    student_id: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().uuid()).required()
  })
};

export const updateApplicationStatusSchema = {
  params: Joi.object({
    application_id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    status: Joi.string().valid('Pending', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected').required()
  })
};

export const withdrawApplicationSchema = {
  params: Joi.object({
    application_id: Joi.number().integer().positive().required()
  })
};
