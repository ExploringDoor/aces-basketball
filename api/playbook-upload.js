// Vercel Serverless Function: /api/playbook-upload   (coach only)
// Hands the coach's browser a short-lived token to upload a video clip of a play straight to
// the "aces-scores" Vercel Blob store (the same store /api/scores uses), so a 100MB game clip
// never passes through this function. The clip's address gets a random suffix, so it can't be
// guessed; the play itself only shows it to signed-in players through /api/playbook.
//
// The browser calls this with the admin passcode in x-admin-key (see playbook-admin.html).

import { handleUpload } from '@vercel/blob/client';
import { staffCodeName } from './_staffauth.js';

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function authed(req) {
  const key = String(req.headers['x-admin-key'] || '');
  const want = process.env.ADMIN_PASSWORD || '';
  if (want && ctEq(key, want)) return true;
  return !!(key && await staffCodeName(req, key));   // a coach's own password (same list as scouting)
}

export const CLIP = { maxBytes: 250 * 1024 * 1024, types: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'] };
export const AUDIO = { maxBytes: 8 * 1024 * 1024, types: ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mpeg', 'audio/mp4', 'audio/webm'] };
export const PHOTO = { maxBytes: 10 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!(await authed(req))) return res.status(401).json({ error: 'unauthorized' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'not_configured' });
  try {
    const json = await handleUpload({
      body: req.body, request: req,
      onBeforeGenerateToken: async (pathname) => {
        const m = /^playbook\/(clips|photos|audio)\/[A-Za-z0-9_-]{1,80}\/[^/]{1,120}$/.exec(pathname);
        if (!m) throw new Error('bad_pathname');
        const kind = m[1] === 'photos' ? PHOTO : m[1] === 'audio' ? AUDIO : CLIP;
        return { allowedContentTypes: kind.types, maximumSizeInBytes: kind.maxBytes, addRandomSuffix: true, tokenPayload: '' };
      },
      onUploadCompleted: async () => {},   // the coach's browser saves the clip onto the play (save_play)
    });
    return res.status(200).json(json);
  } catch (e) {
    return res.status(400).json({ error: 'upload_failed', detail: String((e && e.message) || e).slice(0, 200) });
  }
}
