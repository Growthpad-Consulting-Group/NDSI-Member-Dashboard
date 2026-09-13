import { imagekit } from '@/utils/imageKitService';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { prefix = '/', folders } = req.query;

    if (folders) {
      const result = await imagekit.listFiles({ path: prefix, limit: 100, skip: 0, type: 'folder' });
      const folderNames = Array.from(new Set(result.filter(f => f.type === 'folder').map(f => f.name)));
      return res.status(200).json({ folders: folderNames });
    }

    const limit = 100;
    let skip = 0;
    let all = [];
    let more = true;
    while (more) {
      const files = await imagekit.listFiles({ limit, skip });
      const filtered = files.filter(f => f.type === 'file' && (
        (f.filePath && (f.filePath === prefix || f.filePath.startsWith(prefix + '/')))
        || (f.name && (f.name === prefix || f.name.startsWith(prefix + '/')))
      ));
      all = all.concat(filtered);
      more = files.length === limit;
      skip += limit;
    }
    return res.status(200).json({ files: all });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list files', details: e.message });
  }
}
