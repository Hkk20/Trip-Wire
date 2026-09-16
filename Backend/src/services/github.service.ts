import axios, { AxiosError } from 'axios';
import { AppError } from '../errors.js';

const github = axios.create({
  baseURL: 'https://api.github.com', timeout: 12_000, maxContentLength: 750_000, maxBodyLength: 750_000,
  headers: { Accept: 'application/vnd.github.v3.diff', 'X-GitHub-Api-Version': '2022-11-28' },
});

export class GitHubService {
  static async getPullRequestDiff(owner: string, repo: string, prNumber: number, token: string): Promise<string> {
    try {
      const response = await github.get<string>(`/repos/${owner}/${repo}/pulls/${prNumber}`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'text' });
      if (typeof response.data !== 'string' || !response.data.trim()) throw new AppError(422, 'GitHub returned an empty pull-request diff.', 'EMPTY_DIFF');
      return response.data.slice(0, 500_000);
    } catch (error) {
      if (error instanceof AppError) throw error;
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 401 || status === 403) throw new AppError(502, 'GitHub rejected the server credential or repository access.', 'GITHUB_ACCESS_DENIED');
      if (status === 404) throw new AppError(404, 'Pull request not found or not accessible.', 'PULL_REQUEST_NOT_FOUND');
      throw new AppError(502, 'GitHub could not provide the pull-request diff.', 'GITHUB_UNAVAILABLE');
    }
  }
}
