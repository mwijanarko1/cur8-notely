import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { User } from 'firebase/auth';

// Create a mock AuthContext for testing
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  resetSessionTimer: () => void;
  sessionExpiresAt: Date | null;
}

export const mockUser: User = {
  uid: 'test-user-id',
  email: 'intern@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2023-01-01T00:00:00Z',
    lastSignInTime: '2023-01-01T01:00:00Z',
  },
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  providerId: 'firebase',
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: jest.fn().mockResolvedValue(undefined),
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-id-token',
    signInProvider: 'password',
    expirationTime: '2023-01-01T02:00:00Z',
    issuedAtTime: '2023-01-01T01:00:00Z',
    authTime: '2023-01-01T01:00:00Z',
    claims: {},
  }),
  reload: jest.fn().mockResolvedValue(undefined),
  toJSON: jest.fn().mockReturnValue({}),
};

export const mockAuthContext: AuthContextValue = {
  user: null,
  loading: false,
  error: null,
  signIn: jest.fn().mockResolvedValue(undefined),
  signInWithGoogle: jest.fn().mockResolvedValue(undefined),
  signOut: jest.fn().mockResolvedValue(undefined),
  registerUser: jest.fn().mockResolvedValue(undefined),
  resetSessionTimer: jest.fn(),
  sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
};

// Create a mock AuthContext provider wrapper
export const AuthContextProvider = React.createContext<AuthContextValue>(mockAuthContext);

export function withAuthProvider(
  ui: ReactElement,
  authContextValue: Partial<AuthContextValue> = {}
) {
  const value = { ...mockAuthContext, ...authContextValue };
  
  return (
    <AuthContextProvider.Provider value={value}>
      {ui}
    </AuthContextProvider.Provider>
  );
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    authContextValue?: Partial<AuthContextValue>;
  }
) => {
  const { authContextValue, ...renderOptions } = options || {};
  
  return render(withAuthProvider(ui, authContextValue), renderOptions);
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Mock the Firebase notes module
export const mockNotes = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'This is test note 1 content',
    createdAt: { toDate: () => new Date('2023-01-01T12:00:00Z') },
    updatedAt: { toDate: () => new Date('2023-01-01T12:30:00Z') },
    userId: 'test-user-id',
  },
  {
    id: 'note-2',
    title: 'Test Note 2',
    content: 'This is test note 2 content',
    createdAt: { toDate: () => new Date('2023-01-02T12:00:00Z') },
    updatedAt: { toDate: () => new Date('2023-01-02T12:30:00Z') },
    userId: 'test-user-id',
  }
];

// Add a basic test to prevent the test suite from failing
describe('Test utilities', () => {
  it('mockUser should have correct properties', () => {
    expect(mockUser).toHaveProperty('uid');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser.email).toBe('intern@example.com');
  });
  
  it('mockNotes should have correct structure', () => {
    expect(mockNotes).toHaveLength(2);
    expect(mockNotes[0]).toHaveProperty('id');
    expect(mockNotes[0]).toHaveProperty('title');
    expect(mockNotes[0]).toHaveProperty('content');
  });
}); 