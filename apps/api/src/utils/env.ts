import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
};

export function validateEnv() {
  if (env.NODE_ENV === 'production') {
    if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
    if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }
}
