import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import { GitHubService } from '../services/github.service.js';
import { LLMService } from '../services/llm.service.js';
import { riskFromFindings, scanAddedLines } from '../services/secret-scan.service.js';

const namePattern = /^[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,99})$/;
function getReviewTarget(body: unknown): { owner: string; repo: string; prNumber: number } {
  if (!body || typeof body !== 'object') throw new AppError(400, 'A JSON request body is required.', 'INVALID_PAYLOAD');
  const { owner, repo, prNumber } = body as Record<string, unknown>;
  if (typeof owner !== 'string' || typeof repo !== 'string' || !namePattern.test(owner) || !namePattern.test(repo)) throw new AppError(400, 'owner and repo must be valid GitHub names.', 'INVALID_REPOSITORY');
  const parsedPrNumber = typeof prNumber === 'number' ? prNumber : Number(prNumber);
  if (!Number.isSafeInteger(parsedPrNumber) || parsedPrNumber < 1) throw new AppError(400, 'prNumber must be a positive integer.', 'INVALID_PULL_REQUEST');
  return { owner, repo, prNumber: parsedPrNumber };
}

export async function handlePRAnalysis(req: Request, res: Response): Promise<void> {
  if (!config.githubToken) throw new AppError(503, 'The GitHub integration is not configured on this server.', 'GITHUB_NOT_CONFIGURED');
  const target = getReviewTarget(req.body);
  const diff = await GitHubService.getPullRequestDiff(target.owner, target.repo, target.prNumber, config.githubToken);
  const findings = scanAddedLines(diff);
  const riskLevel = riskFromFindings(findings);
  const llmExplanation = await LLMService.explain(riskLevel, findings);
  const explanation = llmExplanation ?? (findings.length
    ? 'Tripwire found a likely credential in newly added code. Do not merge until it is removed, rotated, and supplied through secure configuration.'
    : 'No high-confidence secret pattern was found in newly added lines. This is a narrow check, not a full security audit.');
  res.status(200).json({ success: true, data: {
    riskLevel, explanation, findings, scannedAt: new Date().toISOString(),
    diffHash: createHash('sha256').update(diff).digest('hex'), llmExplanationEnabled: Boolean(config.openAiApiKey),
    scope: 'Newly added diff lines only; high-confidence secret patterns.', target,
  } });
}
