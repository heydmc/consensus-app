export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;
  const pageSize = Number(req.query.page_size ?? 10);

  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return res.status(400).json({ error: 'page_size must be an integer between 1 and 100' });
  }

  const apiKey = process.env.CONSENSUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: CONSENSUS_API_KEY is not set.' });
  }

  try {
    const consensusUrl = new URL('https://api.consensus.app/v1/search');
    consensusUrl.searchParams.set('query', query.trim());
    consensusUrl.searchParams.set('page_size', String(pageSize));

    const response = await fetch(consensusUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to communicate with Consensus API' });
  }
}
