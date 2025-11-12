import type { Handler } from '@netlify/functions';
import { createSessionCookie, jsonResponse } from './common/auth';

const AUTH_USERNAME = process.env.AUTH_USERNAME ?? 'planner';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? 'raymap';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  if (!event.body) {
    return jsonResponse(400, { error: 'Missing credentials' });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(event.body);
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid JSON payload' });
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('username' in payload) ||
    !('password' in payload)
  ) {
    return jsonResponse(400, { error: 'Missing credentials' });
  }

  const { username, password } = payload as {
    username: unknown;
    password: unknown;
  };

  if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
    return jsonResponse(401, { error: 'Invalid credentials' });
  }

  const cookie = createSessionCookie(String(username));

  return jsonResponse(
    200,
    { user: { username: String(username) } },
    {
      'Set-Cookie': cookie
    }
  );
};
