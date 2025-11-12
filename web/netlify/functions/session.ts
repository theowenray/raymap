import type { Handler } from '@netlify/functions';
import { getSessionFromEvent, jsonResponse } from './common/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const session = getSessionFromEvent(event);

  if (!session) {
    return jsonResponse(200, { user: null });
  }

  return jsonResponse(200, { user: { username: session.username } });
};
