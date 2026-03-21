import Joi from 'joi';

/**
 * Higher-order Express middleware function for robust input validation using Joi schemas.
 * 
 * Supports validating `body`, `query`, and `params`. Strips unknown fields.
 * If validation fails, responds with a 400 Bad Request and clean messages.
 * 
 * @param {Object} schema - Object containing Joi schemas for `body`, `query`, and/or `params`.
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  const requestObjects = ['body', 'query', 'params'];

  // Only pick the objects defined in the passed schema
  requestObjects.forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
    }
  });

  const joiSchema = Joi.object(validSchema);

  // Validate the relevant parts of the request
  const { value, error } = joiSchema.validate(
    {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    { abortEarly: false, stripUnknown: true } // Strip unknown properties to prevent over-posting
  );

  if (error) {
    const errorMessages = error.details.map((details) => details.message).join(', ');
    
    // Do NOT expose internal schema implementation details
    return res.status(400).json({
      success: false,
      message: `Invalid input data: ${errorMessages.replace(/"/g, '')}`,
    });
  }

  // Mutate req with the sanitized and coerced values
  Object.assign(req, value);

  return next();
};

export default validate;
