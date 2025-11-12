import type { HandlerEvent } from '@netlify/functions';
import { describe, expect, it, beforeAll } from 'vitest';
import { handler as loginHandler } from '../netlify/functions/login';
import { handler as logoutHandler } from '../netlify/functions/logout';
import { handler as propertiesHandler } from '../netlify/functions/properties';
import { handler as propertyHandler } from '../netlify/functions/property';
import { handler as sessionHandler } from '../netlify/functions/session';

type HandlerResponse = Awaited<ReturnType<typeof loginHandler>>;

type MinimalEvent = Pick<
  HandlerEvent,
  | 'body'
  | 'headers'
  | 'httpMethod'
  | 'isBase64Encoded'
  | 'multiValueHeaders'
  | 'multiValueQueryStringParameters'
  | 'path'
  | 'queryStringParameters'
  | 'rawQuery'
  | 'rawUrl'
>;

const createEvent = (overrides: Partial<MinimalEvent> = {}): HandlerEvent => ({
  body: null,
  headers: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  path: '/',
  queryStringParameters: {},
  rawQuery: '',
  rawUrl: 'http://localhost/',
  ...overrides
}) as HandlerEvent;

type ParsedResponse = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string | string[]>;
};

const parseResponse = (response: HandlerResponse): ParsedResponse => ({
  statusCode: response.statusCode,
  body: response.body ? JSON.parse(response.body) : null,
  headers: response.headers ?? {}
});

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret';
  process.env.AUTH_USERNAME = 'planner';
  process.env.AUTH_PASSWORD = 'raymap';
});

describe('Netlify function API', () => {
  it('rejects unauthenticated property requests', async () => {
    const response = await propertiesHandler(createEvent());
    expect(response.statusCode).toBe(401);
  });

  it('authenticates and retrieves property data', async () => {
    const loginResponse = parseResponse(
      await loginHandler(
        createEvent({
          httpMethod: 'POST',
          body: JSON.stringify({ username: 'planner', password: 'raymap' })
        })
      )
    );

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toMatchObject({
      user: { username: 'planner' }
    });

    const setCookie = loginResponse.headers['Set-Cookie'] ?? loginResponse.headers['set-cookie'];
    expect(setCookie).toBeTruthy();

    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    const sessionResponse = parseResponse(
      await sessionHandler(
        createEvent({
          headers: {
            cookie: cookieHeader
          }
        })
      )
    );

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.body).toMatchObject({
      user: { username: 'planner' }
    });

    const propertiesResponse = parseResponse(
      await propertiesHandler(
        createEvent({
          headers: {
            cookie: cookieHeader
          }
        })
      )
    );

    expect(propertiesResponse.statusCode).toBe(200);
    expect(Array.isArray((propertiesResponse.body as any).features)).toBe(true);
    const features = (propertiesResponse.body as any).features;
    expect(features.length).toBeGreaterThan(0);

    const parcelId = features[0].properties.parcelId;

    const propertyResponse = parseResponse(
      await propertyHandler(
        createEvent({
          headers: {
            cookie: cookieHeader
          },
          queryStringParameters: {
            parcelId
          }
        })
      )
    );

    expect(propertyResponse.statusCode).toBe(200);
    expect(propertyResponse.body).toMatchObject({
      property: {
        parcelId,
        owner: expect.any(String),
        acreage: expect.any(Number)
      }
    });

    const logoutResponse = await logoutHandler(
      createEvent({
        httpMethod: 'POST',
        headers: {
          cookie: cookieHeader
        }
      })
    );

    expect(logoutResponse.statusCode).toBe(200);
  });
});
