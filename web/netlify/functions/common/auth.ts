import type {
  Handler,
  HandlerContext,
  HandlerEvent,
  HandlerResponse
} from '@netlify/functions';
import { parse, serialize } from 'cookie';
import jwt from 'jsonwebtoken';

export type Session = {
  username: string;
};

const SESSION_COOKIE_NAME = 'raymap_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

const isSecureEnvironment =
  process.env.NETLIFY_DEV !== 'true' && process.env.NODE_ENV === 'production';

const getSecret = () => process.env.SESSION_SECRET ?? 'raymap-dev-secret';

export const createSessionCookie = (username: string) => {
  const token = jwt.sign({ username }, getSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS
  });

  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureEnvironment,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
};

export const clearSessionCookie = () =>
  serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecureEnvironment,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/'
  });

export const getSessionFromEvent = (event: HandlerEvent): Session | null => {
  const cookieHeader = event.headers.cookie ?? event.headers.Cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getSecret());

    if (typeof payload === 'object' && payload && 'username' in payload) {
      const { username } = payload as { username?: unknown };

      if (typeof username === 'string') {
        return { username };
      }
    }
  } catch (error) {
    return null;
  }

  return null;
};

export const jsonResponse = (
  statusCode: number,
  body: unknown,
  extraHeaders?: Record<string, string>
): HandlerResponse => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...(extraHeaders ?? {})
  },
  body: JSON.stringify(body)
});

export const withAuth = (
  handler: (
    event: HandlerEvent,
    context: HandlerContext,
    session: Session
  ) => Promise<HandlerResponse> | HandlerResponse
): Handler => {
  return async (event, context) => {
    const session = getSessionFromEvent(event);

    if (!session) {
      return jsonResponse(401, { error: 'Unauthorized' });
    }

    return handler(event, context, session);
  };
};
