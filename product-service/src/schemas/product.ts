import * as Joi from "joi";

export const ProductSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
});

export interface Product {
  id: string;
  title: string,
  description: string,
  price: number,
}
