import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const nodeEnv = process.env.NODE_ENV ?? 'development';

function requiredInProduction(name: string): string {
  const value = process.env[name]?.trim();
  if (!value && nodeEnv === 'production') {
    throw new Error(`${name} must be set in production.`);
  }
  return value ?? '';
}

const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number.parseInt(process.env.PORT ?? '8080', 10) || 8080,
  sessionSecret: requiredInProduction('SESSION_SECRET') || 'tripwire-development-only-secret-change-me',
  githubToken: process.env.GITHUB_TOKEN?.trim() ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  openAiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
  demoUser: process.env.DEMO_USER?.trim() || 'demo-reviewer',
  trustProxy: process.env.TRUST_PROXY === 'true',
  frontendOrigins,
};
