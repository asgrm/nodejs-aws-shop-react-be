import * as Joi from "joi";

export const importSignedUrl = Joi.object({
  name: Joi.string().required(),
});

