# Frontend Components Documentation

This directory contains all React components used in the Cur8 Notely application.

## Directory Structure

```
components/
├── auth/                 # Authentication-related components
├── notes/                # Note management components
├── ui/                   # Reusable UI components
├── FirebaseInitializer.tsx # Firebase setup component
├── Hero.tsx              # Landing page hero section
└── Navbar.tsx            # Navigation with session expiration warning
```

## Authentication Components

The `auth` directory contains components related to user authentication:

- `ProtectedRoute.tsx`: Higher-order component that redirects unauthenticated users
- `LoginForm.tsx`: Form for user login
- `RegisterForm.tsx`: Form for user registration
- `GoogleSignInButton.tsx`: Button for Google authentication

## Notes Components

The `notes` directory contains components for note management:

- `NotesList.tsx`: Displays all user notes with search and filtering
- `NoteCard.tsx`: Individual note card in the list view
- `NoteForm.tsx`: Form for creating and editing notes

## UI Components

The `ui` directory contains reusable UI components:

- `Button.tsx`: Customizable button with various styles and states
- `Input.tsx`: Text input component with validation
- `TextArea.tsx`: Multiline text input for note content
- `ChatButton.tsx`: Floating button for accessing the AI chat assistant
- `ChatPanel.tsx`: AI chat interface for asking questions about notes

## Core Components

### Navbar

The `Navbar.tsx` component includes the session expiration warning system:

- Displays the navigation links for home, notes, and authentication
- Shows a warning banner when the session is about to expire
- Provides a button to extend the session
- Adapts to both mobile and desktop layouts

```jsx
// Session expiry warning example
{showExpiryWarning && (
  <div className="bg-amber-100 px-4 py-2 flex items-center justify-center">
    <FiClock className="text-amber-600 mr-2" />
    <span className="text-amber-800 text-sm">
      Your session will expire in {timeRemaining}. 
    </span>
    <button 
      onClick={handleExtendSession}
      className="ml-2 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
    >
      Extend Session
    </button>
  </div>
)}
```

### FirebaseInitializer

The `FirebaseInitializer.tsx` component handles Firebase initialization:

- Initializes the Firebase services when the application starts
- Sets up the session expiration monitoring
- Creates the hardcoded user if it doesn't exist
- Handles error recovery

## Session Expiration UI

The session expiration functionality includes several UI components:

1. **Warning Banner**: Appears 2 minutes before session expiration
2. **Timer Display**: Shows countdown to session expiration
3. **Extend Session Button**: Allows users to reset the session timer
4. **Activity Monitoring**: Tracks user interactions to reset the timer automatically

## Component Usage Examples

### Protected Route

```jsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SecurePage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### Note Form

```jsx
import NoteForm from '@/components/notes/NoteForm';

// Create a new note
<NoteForm 
  onSubmit={handleSubmit} 
  onCancel={handleCancel} 
  isSubmitting={isSubmitting} 
/>

// Edit an existing note
<NoteForm 
  note={existingNote} 
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isSubmitting={isSubmitting}
/>
```

### Session Expiration Handling

The session expiration UI is automatically handled by the `Navbar` component. It communicates with the token manager through the `useAuth` hook:

```jsx
const { user, sessionExpiresAt, resetSessionTimer } = useAuth();

// Check if session is about to expire
useEffect(() => {
  if (!user || !sessionExpiresAt) return;
  
  const checkSessionExpiry = () => {
    const now = new Date();
    const timeDiff = sessionExpiresAt.getTime() - now.getTime();
    
    // Show warning if less than 2 minutes remaining
    setShowExpiryWarning(timeDiff > 0 && timeDiff < 2 * 60 * 1000);
  };
  
  const interval = setInterval(checkSessionExpiry, 10000);
  return () => clearInterval(interval);
}, [user, sessionExpiresAt]);

// Extend the session
const handleExtendSession = () => {
  resetSessionTimer();
  setShowExpiryWarning(false);
};
```

## Styling

The components use TailwindCSS for styling, providing:

- Consistent design language across the application
- Responsive layouts for all screen sizes
- Accessible UI elements with proper focus states
- Dark mode support in key components
- Interactive hover and focus states

## Testing

Component tests verify:

- UI rendering and interaction
- Form validation and submission
- Protected route redirection
- Session expiration UI behavior

Run component tests with:

```bash
npm test -- --testPathPattern=src/components
``` 