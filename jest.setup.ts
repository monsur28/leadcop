import '@testing-library/jest-dom';

// Optional: Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
      refresh: () => null,
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  redirect() {
    return null;
  }
}));

// Optional: Mock next-auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
  }),
}));
