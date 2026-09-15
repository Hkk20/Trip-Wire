import { Request, Response } from 'express';
import { Session } from 'express-session'; // 💡 NEW: Import the Session definition model directly
import { GitHubService } from '../services/github.service';
import { LLMservice } from '../services/llm.service';

// 💡 NEW: Build a quick custom wrapper type strictly for this controller file
interface CustomRequest extends Request {
  session: Session & {
    user?: {
      id: string;
      username: string;
      githubToken?: string;
    };
  };
}

// 💡 Fixed: Swapped standard base 'Request' for our new 'CustomRequest' map wrapper
export const handlePRAnalysis = async (req: CustomRequest, res: Response) => {
  const { owner, repo, prNumber } = req.body;

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
    const cleanDiffText = await GitHubService.getPullreq(owner, repo, Number(prNumber), resolvedToken);
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
