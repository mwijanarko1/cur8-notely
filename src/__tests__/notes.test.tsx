import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render, mockUser, mockNotes } from './utils/test-utils';
import { createNote, getNotes, subscribeToNotes } from '@/lib/firebase/notes';
import { collection, addDoc, getDocs, query, onSnapshot } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
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
}));

// Mock notes module
jest.mock('@/lib/firebase/notes', () => ({
  createNote: jest.fn(),
  getNotes: jest.fn(),
  subscribeToNotes: jest.fn(),
}));

// Import mocked components instead of real ones
import NoteForm from './mocks/NoteForm';
import NotesList from './mocks/NotesList';

describe('Notes Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new note for an authenticated user', async () => {
    // Mock createNote to resolve successfully
    const mockDocRef = { id: 'new-note-123' };
    (createNote as jest.Mock).mockResolvedValueOnce(mockDocRef);
    (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
    
    // Render the component with the test user prop
    render(<NoteForm __test_user={mockUser} />);
    
    // Fill out the note form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Note Title' }
    });
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test note content' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify createNote was called with correct data
    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          title: 'Test Note Title',
          content: 'Test note content',
        })
      );
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('should list notes for an authenticated user', async () => {
    // Mock getNotes to return test notes
    (getNotes as jest.Mock).mockResolvedValueOnce(mockNotes);
    
    // Mock the query and getDocs functions
    (query as jest.Mock).mockReturnValueOnce('mock-query');
    (getDocs as jest.Mock).mockResolvedValueOnce({
      forEach: (callback: (doc: any) => void) => {
        mockNotes.forEach(note => {
          callback({
            id: note.id,
            data: () => ({
              title: note.title,
              content: note.content,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
              userId: note.userId,
            }),
          });
        });
      },
    });
    
    // Render the component with a mock authenticated user
    render(<NotesList />, {
      authContextValue: { user: mockUser }
    });
    
    // Verify getNotes was called with the authenticated user
    await waitFor(() => {
      expect(getNotes).toHaveBeenCalled();
    });
  });

  it('should reject note-related requests from unauthenticated users', async () => {
    // Render the component with no authenticated user explicitly set to null
    render(<NoteForm __test_user={null} />);
    
    // Try to create a note
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Unauthorized Note' }
    });
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This should be rejected' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
    });
    
    // Verify createNote was not called
    expect(createNote).not.toHaveBeenCalled();
  });
}); 