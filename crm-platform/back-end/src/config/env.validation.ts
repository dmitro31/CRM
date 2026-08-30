import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  APP_NAME: Joi.string().required(),

  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(30).required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),

  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  GOOGLE_CALLBACK_URL: Joi.string().required(),

  CORS_ORIGIN: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),

  REDIS_PORT: Joi.number().required(),

  STORAGE_ENDPOINT: Joi.string().required(),

  STORAGE_PORT: Joi.number().required(),

  STORAGE_ACCESS_KEY: Joi.string().required(),

  STORAGE_SECRET_KEY: Joi.string().required(),

  STORAGE_BUCKET: Joi.string().required(),

  GEMINI_API_KEY: Joi.string().required(),

  GEMINI_MODEL: Joi.string().required(),
});
