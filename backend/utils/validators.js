// validators/userValidation.js
import Joi from "joi";

export const validateUserInput = (data) => {
  const schema = Joi.object({
    uid: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty": "UID is required",
        "any.required": "UID field is required"
      }),

    name: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 50 characters"
      }),

    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.email": "Email must be a valid email address",
        "string.empty": "Email is required"
      }),

    department: Joi.string()
      .trim()
      .min(2)
      .required()
      .messages({
        "string.empty": "Department is required",
        "string.min": "Department must be at least 2 characters long"
      }),

    graduationYear: Joi.string()
      .trim()
      .pattern(/^\d{4}-\d{4}$/)
      .required()
      .messages({
        "string.empty": "Batch is required",
        "string.pattern.base": "Batch must be in the format YYYY-YYYY (e.g., 2020-2024)"
      }),

    role: Joi.string()
      .valid("alumni", "student", "admin")
      .default("alumni")
      .messages({
        "any.only": "Role must be one of: alumni, student, or admin"
      }),

    verified: Joi.boolean().default(false),

    createdAt: Joi.date().default(() => new Date(), "current date"),
  });

  return schema.validate(data, { abortEarly: false });
};
