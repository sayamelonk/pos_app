import joi from "joi";

export const categoryValidation = (payload) => {
  const schema = joi.object({
    categoryName: joi.string().trim().required(),
  });
  return schema.validate(payload);
}