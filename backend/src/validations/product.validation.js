import joi from "joi";

export const productValidation = (payload) => {
  const schema = joi.object({
    productName: joi.string().trim().required(),
    price: joi.number().required(),
    qty: joi.number().required(),
    kategoryId: joi.number().required(),
    supplierId: joi.number().required(),
    barcode: joi.string().trim().allow(null).allow(""),
    image: joi.string().trim().allow(null).allow(""),
    url: joi.string().trim().allow(null).allow(""),
    file: joi.string().trim().allow(null).allow(""),
  });
  return schema.validate(payload);
};
