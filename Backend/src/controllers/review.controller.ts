import { Request, Response } from 'express';
import { GitHubService } from '../services/github.service';
import { LLMservice } from '../services/llm.service'; // 💡 Fixed: Lowercase 's' to match your file

export const handlePRAnalysis = async (req: Request, res: Response) => {
  const { owner, repo, prNumber } = req.body;

  // 💡 Fixed: Clean inline logical verification structure for your session data
  const resolvedToken = (req.session && req.session.user) ? req.session.user.githubToken : process.env.GITHUB_PAT;

  if (!owner || !repo || !prNumber) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Payload Parameters',
      message: 'Missing owner, repo, or prNumber fields in request body.'
    });
  }

  if (!resolvedToken) {
    return res.status(401).json({
      success: false,
      error: 'Missing Access Credentials',
      message: 'Active GitHub authorization token could not be resolved.'
    });
  }

  try {
    // 💡 Fixed: Lowercase 'r' in getPullreq to match your service file layout
    const cleanDiffText = await GitHubService.getPullreq(owner, repo, Number(prNumber), resolvedToken);

    // 💡 Fixed: Lowercase 's' in LLMservice to match your service file layout
    const aiAnalysisCard = await LLMservice.patchrisk(cleanDiffText);

    return res.status(200).json({
      success: true,
      data: aiAnalysisCard
    });

  } catch (error: any) {
    console.error('⚠️ Tripwire Processing Engine Crash:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Core Pipeline Analysis Failure',
      message: `Failed to compile risk audit cards: ${error.message}`
    });
  }
};
