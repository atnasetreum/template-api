import 'dotenv/config';
import * as joi from 'joi';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

interface EnvVars {
  NODE_ENV: Environment;
  PORT: number;
  WHITE_LIST_DOMAINS: string;
  APP_KEY: string;
  DATABASE_URL: string;
  CRYPTOJS_KEY: string;
  CRYPTOJS_IV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const envVarsSchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .valid(Environment.Development, Environment.Production)
      .required(),
    PORT: joi.number().required(),
    WHITE_LIST_DOMAINS: joi.string().required(),
    APP_KEY: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    CRYPTOJS_KEY: joi.string().required(),
    CRYPTOJS_IV: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  NODE_ENV: envVars.NODE_ENV,
  APP_KEY: envVars.APP_KEY,
  PORT: envVars.PORT,
  WHITE_LIST_DOMAINS: envVars.WHITE_LIST_DOMAINS,
  CRYPTOJS_KEY: envVars.CRYPTOJS_KEY,
  CRYPTOJS_IV: envVars.CRYPTOJS_IV,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,
};
