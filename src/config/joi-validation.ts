// import Joi from 'joi';
import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.string().default('dev'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().default('AnyList'),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.required(),
});
