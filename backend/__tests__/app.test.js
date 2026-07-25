const request = require('supertest');
const app = require('../app');

describe('App Core Endpoints', () => {
  it('should return 200 OK for /health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 404 for an invalid route', async () => {
    const res = await request(app).get('/api/invalid-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Route not found');
  });
});
