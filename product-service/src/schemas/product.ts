import * as Joi from "joi";

export const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().strict().required(),
  count: Joi.number().positive().required(),
});

