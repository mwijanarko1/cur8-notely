# Backend Library Documentation

This directory contains the core backend functionality for Cur8 Notely, implemented with Firebase services.

## Directory Structure

```
firebase/
├── auth.ts           # Authentication functions
├── firebase.ts       # Firebase initialization and configuration
├── init.ts           # Application initialization
├── notes.ts          # Notes CRUD operations
└── tokenManager.ts   # Session expiration management
```

## Firebase Configuration

The application uses Firebase for authentication and data storage. The configuration is set up in `firebase.ts`:

- **Authentication**: Firebase Authentication with email/password and Google sign-in
- **Database**: Cloud Firestore for storing user notes
- **Security**: Custom security rules to restrict access to user data

## Authentication Implementation

The `auth.ts` file implements all authentication-related functionality:

### Features

- User registration with email and password
- Email/password login
- Google authentication
- Support for the hardcoded user required in the PRD (`intern`/`letmein`)
- Automatic sign-out on session expiration

### Functions

- `registerUser`: Creates a new user account
- `signIn`: Authenticates a user, with special handling for the hardcoded user
- `signInWithGoogle`: Implements Google authentication
- `signOut`: Logs out the current user
- `getCurrentUser`: Gets the currently authenticated user
- `onAuthChange`: Observer for authentication state changes

## Session Management

The application enforces a 15-minute session expiration as required by the PRD, implemented in `tokenManager.ts`:

### Features

- Automatic session expiration after 15 minutes of inactivity
- Activity tracking for user interactions
- Automatic session refresh on user activity
- Warning notification 2 minutes before expiration
- Manual session extension option

### How It Works

1. The token manager starts a timer when a user logs in
2. User interactions reset the inactivity timer
3. After 15 minutes of inactivity, the user is automatically logged out
4. Browser activity listeners monitor user interactions
5. A warning appears 2 minutes before the session expires

### Security Considerations

- Firebase tokens have their own expiration (1 hour by default)
- The client-side timer provides an additional, more restrictive layer of security
- Browser session persistence ensures tokens are cleared when the browser is closed
- Activity monitoring provides a balance between security and user experience

## Notes CRUD Operations

The `notes.ts` file implements all note-related operations:

### Features

- Create, read, update, and delete notes
- Real-time synchronization
- Secure access using Firestore security rules

### Functions

- `addNote`: Creates a new note for the authenticated user
- `getNotes`: Retrieves all notes for the authenticated user
- `updateNote`: Updates an existing note
- `deleteNote`: Removes a note
- `listenToNotes`: Sets up a real-time listener for note changes

## Application Initialization

The `init.ts` file handles application startup tasks:

- Sets up the hardcoded user if it doesn't exist
- Initializes Firebase services
- Handles error recovery

## Usage Examples

### Authentication

```typescript
import { signIn, signOut } from '@/lib/firebase/auth';

// Login
try {
  await signIn('user@example.com', 'password');
  console.log('Logged in successfully');
} catch (error) {
  console.error('Login failed:', error);
}

// Logout
try {
  await signOut();
  console.log('Logged out successfully');
} catch (error) {
  console.error('Logout failed:', error);
}
```

### Note Operations

```typescript
import { addNote, updateNote, deleteNote } from '@/lib/firebase/notes';

// Add a note
const newNote = await addNote({
  title: 'My Note',
  content: 'This is a test note'
});

// Update a note
await updateNote(newNote.id, {
  title: 'Updated Title',
  content: 'Updated content'
});

// Delete a note
await deleteNote(newNote.id);
```

### Session Management

```typescript
import { resetExpiryTimer } from '@/lib/firebase/tokenManager';

// Reset the session expiration timer
resetExpiryTimer();
```

## Testing

The library functions have associated tests to verify functionality:

- Authentication tests verify login, registration, and session management
- Notes tests verify CRUD operations and security rules
- Token manager tests verify expiration and refresh behavior

Run tests for this directory with:

```bash
npm test -- --testPathPattern=src/lib
``` 