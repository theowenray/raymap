import type { Handler } from '@netlify/functions';
import { clearSessionCookie, jsonResponse } from './common/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  return jsonResponse(
    200,
    { ok: true },
    {
      'Set-Cookie': clearSessionCookie()
    }
  );
};
