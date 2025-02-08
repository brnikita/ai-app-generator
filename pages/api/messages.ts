import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  // Simulate processing the prompt.
  const dummyResponse = `AI Response: ${prompt.slice(0, 100)}...`;

  return res.status(200).json({
    content: dummyResponse,
    suggestions: ['Consider adding a footer', 'Optimize component code'],
    metadata: {},
  });
}
