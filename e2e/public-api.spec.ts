import { test, expect } from '@playwright/test';

test.describe('Public Validation API', () => {
  // Mock test for the /api/v1/validate endpoint
  // In a real scenario, we'd need an actual seeded API key in the test DB
  
  test('should reject requests without API key', async ({ request }) => {
    const response = await request.post('/api/v1/validate', {
      data: {
        email: 'test@example.com',
        ipAddress: '127.0.0.1',
      }
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Unauthorized');
  });

  test('should reject invalid HTTP methods', async ({ request }) => {
    const response = await request.get('/api/v1/validate');
    expect(response.status()).toBe(405); // Next.js returns 405 Method Not Allowed
  });
});
