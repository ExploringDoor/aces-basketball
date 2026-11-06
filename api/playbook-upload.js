// Vercel Serverless Function: /api/playbook-upload   (coach only)
// Hands the coach's browser a short-lived token to upload a video clip of a play straight to
// the "aces-scores" Vercel Blob store (the same store /api/scores uses), so a 100MB game clip
// never passes through this function. The clip's address gets a random suffix, so it can't be
// guessed; the play itself only shows it to signed-in players through /api/playbook.
//
// The browser calls this with the admin passcode in x-admin-key (see playbook-admin.html).

import { handleUpload } from '@vercel/blob/client';

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function authed(req) { const want = process.env.ADMIN_PASSWORD || ''; return !!want && ctEq(req.headers['x-admin-key'] || '', want); }

export const CLIP = { maxBytes: 250 * 1024 * 1024, types: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'] };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'unauthorized' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'not_configured' });
  try {
    const json = await handleUpload({
      body: req.body, request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^playbook\/clips\/[A-Za-z0-9_-]{1,80}\/[^/]{1,120}$/.test(pathname)) throw new Error('bad_pathname');
        return { allowedContentTypes: CLIP.types, maximumSizeInBytes: CLIP.maxBytes, addRandomSuffix: true, tokenPayload: '' };
      },
      onUploadCompleted: async () => {},   // the coach's browser saves the clip onto the play (save_play)
    });
    return res.status(200).json(json);
  } catch (e) {
    return res.status(400).json({ error: 'upload_failed', detail: String((e && e.message) || e).slice(0, 200) });
  }
}
