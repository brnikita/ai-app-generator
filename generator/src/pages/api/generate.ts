import { NextApiRequest, NextApiResponse } from 'next';
import cors, { runMiddleware } from './middleware/cors';
import { AIService } from '../../core/services/ai-service';

const aiService = new AIService(process.env.AI_API_KEY || '', process.env.AI_API_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const config = await aiService.generateProjectConfig(description);
    res.status(200).json(config);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate project configuration' });
  }
}
