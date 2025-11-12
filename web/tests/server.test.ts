import request from 'supertest';

process.env.NODE_ENV = 'test';
const { app } = await import('../server/index.js');

describe('Raymap API', () => {
  it('rejects unauthenticated property requests', async () => {
    const response = await request(app).get('/api/properties');
    expect(response.status).toBe(401);
  });

  it('authenticates and retrieves property data', async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post('/api/login').send({
      username: 'planner',
      password: 'raymap'
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user).toEqual({ username: 'planner' });

    const propertiesResponse = await agent.get('/api/properties');
    expect(propertiesResponse.status).toBe(200);
    expect(Array.isArray(propertiesResponse.body.features)).toBe(true);
    expect(propertiesResponse.body.features.length).toBeGreaterThan(0);

    const parcelId = propertiesResponse.body.features[0].properties.parcelId;
    const propertyResponse = await agent.get(`/api/properties/${parcelId}`);
    expect(propertyResponse.status).toBe(200);
    expect(propertyResponse.body.property).toMatchObject({
      parcelId,
      owner: expect.any(String),
      acreage: expect.any(Number)
    });
  });
});
