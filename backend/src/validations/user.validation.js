import joi from "joi";

export const userValidation = (payload) => {
  const schema = joi.object({
    name: joi.string().trim().required(),
    userName: joi.string().min(6).trim().required(),
    password: joi.string().min(6).max(20).required(),
    confirmPassword: joi
      .any()
      .equal(joi.ref("password"))
      .required()
      .label("Password Confirmation")
      .messages({
        "any.only": "{{#label}} does not match",
        "any.required": "{{#label}} is required",
      }),
    role: joi.string().trim().required(),
  });
  return schema.validate(payload);
};

export const userUpdateValidation = (payload) => {
  const schema = joi.object({
    name: joi.string().trim().required(),
    userName: joi.string().min(6).trim().required(),
    password: joi.string().allow(null).allow(""),
    confirmPassword: joi
      .any()
      .equal(joi.ref("password"))
      .required()
      .label("Password Confirmation")
      .messages({
        "any.only": "{{#label}} does not match",
        "any.required": "{{#label}} is required",
      }),
    role: joi.string().trim().required(),
  });
  return schema.validate(payload);
};
