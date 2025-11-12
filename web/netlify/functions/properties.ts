import { jsonResponse, withAuth } from './common/auth';
import { propertiesCollection } from './common/data';

export const handler = withAuth(async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  return jsonResponse(200, propertiesCollection);
});
