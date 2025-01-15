import joi from "joi";

export const orderReturnValidation = (payload) => {
  const schema = joi.object({
    date: joi.date().required(),
    note: joi.string().trim().required(),
    orderId: joi.number().required(),
    userId: joi.number().required(),
    detail: joi.array().required(),
  });
  return schema.validate(payload);
};
