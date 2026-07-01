import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),
  DATABASE_URL: Joi.string().optional(),
  DATABASE_HOST: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_PORT: Joi.number().default(6543),
  DATABASE_USER: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_PASSWORD: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_NAME: Joi.string().default('postgres'),
  DATABASE_SSL: Joi.string().valid('true', 'false').default('true'),
  DATABASE_POOLER: Joi.string().valid('true', 'false').default('true'),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  SUPABASE_JWT_SECRET: Joi.string().optional().allow(''),
  SUPABASE_STORAGE_BUCKET: Joi.string().default('submissions'),
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  CORS_ALLOW_VERCEL: Joi.string().valid('true', 'false').default('true'),
});

export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '6543', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME ?? 'postgres',
    ssl: process.env.DATABASE_SSL !== 'false',
    pooler: process.env.DATABASE_POOLER !== 'false',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'submissions',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
});
