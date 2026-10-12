import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../utils/env';
import { logger } from '../../utils/logger';

export interface AiProvider {
  complete(prompt: string, systemPrompt?: string): Promise<string>;
}

class AnthropicProvider implements AiProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const msg = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      ...(systemPrompt && { system: systemPrompt }),
      messages: [{ role: 'user', content: prompt }],
    });
    const block = msg.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type');
    return block.text;
  }
}

class MockProvider implements AiProvider {
  async complete(prompt: string): Promise<string> {
    logger.debug('MockProvider: returning stub response');
    if (prompt.includes('parse') || prompt.includes('job description')) {
      return JSON.stringify({
        title: 'Software Engineer',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        experienceYears: 3,
        location: 'Remote',
        workMode: 'REMOTE',
        responsibilities: ['Build features', 'Write tests', 'Code review'],
        requirements: ['3+ years experience', 'Strong JS skills'],
      });
    }
    if (prompt.includes('match') || prompt.includes('score')) {
      return JSON.stringify({
        overallScore: 75,
        skillsScore: 80,
        experienceScore: 70,
        locationScore: 90,
        availabilityScore: 85,
        reasoning: 'Good skills match with relevant experience.',
      });
    }
    return JSON.stringify({ result: 'Mock AI response', keywords: [] });
  }
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

let _provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!_provider) {
    _provider = env.ANTHROPIC_API_KEY
      ? new AnthropicProvider(env.ANTHROPIC_API_KEY)
      : new MockProvider();
  }
  return _provider;
}
