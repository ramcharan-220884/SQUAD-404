import { body, validationResult } from "express-validator";

// Reusable middleware to catch and format validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email address is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),
  body("role").isIn(["student", "company"]).withMessage("Valid role (student or company) is required")
];

export const postJobValidator = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("deadline").isISO8601().toDate().withMessage("A valid application deadline date is required"),
  body("min_cgpa").optional({ checkFalsy: true }).isFloat({ min: 0, max: 10 }).withMessage("Minimum CGPA must be a number between 0 and 10")
];

export const updateProfileValidator = [
  body("cgpa").optional({ checkFalsy: true }).isFloat({ min: 0, max: 10 }).withMessage("CGPA must be a number between 0 and 10"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("A valid email address is required").normalizeEmail()
];
