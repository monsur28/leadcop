import { addDomainAction, getUserDomainsAction } from '../actions';
import { prismaMock } from '../../../../prisma-mock';
import { DomainService } from '../services';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('Domain Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDomainAction', () => {
    it('returns error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      await expect(addDomainAction({ hostname: 'test.com' })).rejects.toThrow('Authentication required');
    });

    it('adds a domain successfully when authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      const mockDomain = {
        id: 'domain-1',
        hostname: 'test.com',
        userId: 'user-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // We mock prisma behavior indirectly via the mocked prisma client
      prismaMock.domain.create.mockResolvedValue(mockDomain);
      prismaMock.domain.count.mockResolvedValue(0); // For quota check
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1', userId: 'user-1', planId: 'plan-1', status: 'ACTIVE', currentPeriodEnd: new Date(), extraCredits: 0, createdAt: new Date(), updatedAt: new Date(), isUnlimited: false
      } as any);
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-1', name: 'Pro', monthlyPrice: 10, yearlyPrice: 100, quotaLimit: 1000, domainLimit: 1, apiKeyLimit: 10, rateLimitPerMinute: 60, roleDetection: false, publicDetection: false, slug: 'pro', createdAt: new Date(), updatedAt: new Date()
      } as any);

      const res = await addDomainAction({ hostname: 'test.com' });
      expect(res.success).toBe(true);
      expect((res as any).data.hostname).toBe('test.com');
    });
  });
});
