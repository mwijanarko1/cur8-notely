// Import needed testing libraries
import '@testing-library/jest-dom';

// Mock Firebase App
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn().mockReturnValue({
      name: '[DEFAULT]',
    }),
    getApps: jest.fn().mockReturnValue([{
      name: '[DEFAULT]',
    }]),
    getApp: jest.fn().mockReturnValue({
      name: '[DEFAULT]',
    }),
  };
});

// Mock Firebase Auth
jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  
  return {
    ...originalModule,
    getAuth: jest.fn().mockReturnValue({
      currentUser: null,
    }),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
      addScope: jest.fn(),
    })),
    signInWithPopup: jest.fn(),
    setPersistence: jest.fn().mockResolvedValue(undefined),
    browserSessionPersistence: 'SESSION',
  };
});

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  return {
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn().mockReturnValue(new Date()),
    Timestamp: {
      fromDate: jest.fn(date => ({ toDate: () => date })),
      now: jest.fn(() => ({ toDate: () => new Date() })),
    },
    onSnapshot: jest.fn(),
    getFirestore: jest.fn(),
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

// Add a basic test to make setup.ts not fail
describe('Test setup', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});

// Global mocks setup
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock window object for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 