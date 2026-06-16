import { loginAction } from '../actions';
import { signIn } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  auth: jest.fn(),
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginAction', () => {
    it('returns error for invalid input', async () => {
      const result = await loginAction({ email: 'not-an-email', password: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input');
    });

    it('calls signIn on success', async () => {
      (signIn as jest.Mock).mockResolvedValue(true);
      
      const result = await loginAction({ email: 'test@example.com', password: 'password123' });
      
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
