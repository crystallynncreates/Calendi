export default async function handler(req, res) {
  const { q, pageToken } = req.query;

  res.setHeader('Cache-Control', 'public, max-age=60');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Missing q' });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'YouTube API key not configured',
      setup: 'Add YOUTUBE_API_KEY to Vercel Environment Variables (Project → Settings → Environment Variables)',
    });
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '12',
    q: q.trim(),
    key,
    ...(pageToken ? { pageToken } : {}),
  });

  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    headers: {
      'Referer': 'https://calendi-khaki.vercel.app/',
      'Origin': 'https://calendi-khaki.vercel.app',
    },
  });
  const data = await r.json();

  if (!r.ok) {
    return res.status(r.status).json(data);
  }

  return res.status(200).json({
    items: (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
      published: item.snippet.publishedAt,
    })),
    nextPageToken: data.nextPageToken || null,
  });
}
