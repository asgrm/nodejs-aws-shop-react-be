import * as Joi from "joi";

export const importSignedUrl = Joi.object({
  name: Joi.string().required(),
});

export const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  count: Joi.number().positive().required(),
}).unknown(true);

