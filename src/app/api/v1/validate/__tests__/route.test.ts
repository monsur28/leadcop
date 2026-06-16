import { POST } from '../route';
import { prismaMock } from '../../../../../../prisma-mock';
import { NextRequest } from 'next/server';

describe('Validation API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any, headers: Record<string, string>) => {
    const req = new NextRequest('http://localhost/api/v1/validate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    Object.entries(headers).forEach(([key, value]) => {
      req.headers.set(key, value);
    });
    return req;
  };

  it('rejects missing API key', async () => {
    const req = createMockRequest({}, {});
    const res = await POST(req);
    expect(res.status).toBe(401);
    
    const json = await res.json();
    expect(json.error).toContain('Unauthorized');
  });

  it('rejects invalid API key format', async () => {
    const req = createMockRequest({}, { authorization: 'Bearer invalid_format' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
