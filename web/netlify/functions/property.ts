import { jsonResponse, withAuth } from './common/auth';
import { getProperty } from './common/data';

export const handler = withAuth(async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const parcelId = event.queryStringParameters?.parcelId;

  if (!parcelId) {
    return jsonResponse(400, { error: 'parcelId query parameter is required' });
  }

  const property = getProperty(parcelId);

  if (!property) {
    return jsonResponse(404, { error: 'Property not found' });
  }

  return jsonResponse(200, { property });
});
