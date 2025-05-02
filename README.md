# Cur8 Notely

A secure note-taking application with user authentication built with Next.js and Firebase. Built by [@mikhailbuilds](https://mikhailwijanarko.xyz).

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Session Management**: 15-minute session expiration with activity tracking and auto-logout
- **Note Management**: Create, read, update, and delete personal notes
- **Real-time Updates**: Notes are updated in real-time using Firestore
- **AI Assistant**: Ask questions about your notes using the built-in AI chat assistant
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Search Functionality**: Quickly find notes with the built-in search feature

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Firebase (Authentication, Firestore)
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: TailwindCSS for responsive design
- **AI Integration**: Google Gemini API
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Google Gemini API key (for AI assistant features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mwijanarko1/cur8-notely.git
   cd cur8-notely
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase and Gemini API configuration:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   
   # Google Gemini API
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Firebase Setup

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore services
3. Set up Authentication methods:
   - Email/Password authentication
   - Google authentication (optional)
4. Deploy Firestore security rules using the included `firestore.rules` file:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Authentication and Session Management

The application implements a 15-minute session expiration mechanism as specified in the requirements:

- Sessions automatically expire after 15 minutes of inactivity
- User activity (mouse movement, keyboard input, etc.) resets the inactivity timer
- A warning appears 2 minutes before session expiration
- Users can manually extend their session by clicking the "Extend Session" button
- API requests and note interactions automatically reset the session timer

The session expiration implements these security best practices:
1. Activity-based expiration rather than a fixed timeout
2. Client-side activity monitoring
3. Browser session persistence (session cleared on browser close)
4. User-friendly warnings and session extension

## Hardcoded User Credentials

For development and testing purposes, the application includes a hardcoded user as specified in the requirements:

- Username: `intern`
- Password: `letmein`

This user is automatically created in Firebase when the application initializes.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes for Gemini integration
│   ├── login/                # Login page
│   ├── notes/                # Notes page (protected)
│   ├── register/             # Registration page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with auth provider
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── auth/                 # Authentication components
│   ├── notes/                # Note-related components
│   ├── ui/                   # Reusable UI components
│   ├── FirebaseInitializer.tsx # Firebase setup component
│   ├── Hero.tsx              # Landing page hero section
│   └── Navbar.tsx            # Navigation with session expiration warning
├── hooks/                    # Custom React hooks
│   ├── useAuth.tsx           # Authentication hook with session management
│   └── useNotes.tsx          # Notes management hook
├── lib/                      # Library code
│   └── firebase/             # Firebase configuration and services
│       ├── auth.ts           # Authentication functions
│       ├── firebase.ts       # Firebase initialization
│       ├── init.ts           # Application initialization
│       ├── notes.ts          # Notes CRUD operations
│       └── tokenManager.ts   # Session expiration management
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions and helpers
    └── validations.ts        # Form validation schemas
```

## Testing

The application includes automated tests to verify key functionality:

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- -t "authentication"

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Tests for individual components and utility functions
- **Integration Tests**: Tests for authentication flows and note operations
- **Component Tests**: Tests for UI components and their interactions

The tests follow the requirements in the PRD:
- Authentication Tests: Verify successful login with hardcoded credentials and failed login with incorrect credentials
- Notes Functionality Tests: Verify note creation, listing, and proper access control for unauthenticated users

### Mock Strategy

The tests use Jest mocks to simulate Firebase services:
- Firebase Authentication: Mocked to test login success/failure without actual Firebase calls
- Firebase Firestore: Mocked to test note operations without a real database
- Session Expiration: Tests verify token expiration behavior

### Manual Testing

You can manually test the session expiration by:

1. Logging in with test credentials
2. Waiting for ~13 minutes without interaction
3. Observing the session expiration warning
4. Waiting another 2 minutes to see the auto-logout

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add your environment variables
4. Deploy!

## Trade-offs and Production Improvements

With more time, the following improvements could be made:

1. **Server-Side Session Management**: Implement server-side session validation in addition to client-side
2. **Refresh Tokens**: Use Firebase refresh tokens for more secure session management
3. **Comprehensive Testing**: Add comprehensive unit and integration tests with higher coverage
4. **Advanced Note Features**: Add rich text editing, tagging, and categories
5. **Offline Support**: Implement offline capabilities with service workers
6. **Multi-user Collaboration**: Allow sharing and collaboration on notes
7. **End-to-End Encryption**: Implement client-side encryption for maximum security
8. **Rate Limiting**: Add API rate limiting to prevent abuse
9. **Password Policies**: Enforce stronger password requirements
10. **CAPTCHA Integration**: Add CAPTCHA to prevent automated attacks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Security Best Practices

This application implements several security best practices:

1. **Environment Variables**: All API keys and sensitive configuration values are stored in environment variables and accessed securely.
2. **Server-Only API Keys**: The Gemini API key is only used on the server side and never exposed to the client.
3. **Firebase Security Rules**: Firestore security rules ensure users can only access their own data.
4. **Authentication**: Firebase Authentication handles secure user management.
5. **Session Management**: Automatic session expiration provides additional security.
