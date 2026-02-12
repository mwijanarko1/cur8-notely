# Cur8 Notely

A secure note-taking application with user authentication built with Next.js and Firebase. Built by [@mikhailbuilds](https://mikhailwijanarko.xyz).

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Session Management**: 15-minute session expiration with activity tracking and auto-logout
- **Note Management**: Create, read, update, and delete personal notes with rich text editing
- **Rich Text Editor**: TipTap-based editor with formatting, headings, links, and code blocks
- **Real-time Updates**: Notes are updated in real-time using Firestore
- **AI Assistant**: Ask questions about your notes using Google Gemini AI integration
- **Export Options**: Export notes to PDF or DOCX format
- **Note Sharing**: Share notes via public links
- **Search Functionality**: Quickly find notes with the built-in search feature
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Rate Limiting**: API endpoints protected with rate limiting

## Tech Stack

- **Frontend**: Next.js 16.1.6, React 19.2.4, TypeScript, TailwindCSS 4.1.18
- **Backend**: Firebase 12.9.0 (Authentication, Firestore)
- **Form Handling**: React Hook Form 7.71.1 with Zod 4.3.6 validation
- **Styling**: TailwindCSS 4.1.18 with PostCSS 8.5.6
- **AI Integration**: Google Generative AI 0.24.1
- **Icons**: React Icons 5.5.0
- **Testing**: Jest 30.2.0 with React Testing Library
- **Rich Text**: TipTap 3.19.0 editor

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

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack

# Building
npm run build            # Create production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:required    # Run required PRD tests (auth & notes)
```

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
│   ├── api/                  # API routes
│   │   ├── chat/             # Gemini chat API
│   │   └── test-gemini/      # Gemini test endpoint
│   ├── login/                # Login page
│   ├── notes/                # Notes page (protected)
│   ├── register/             # Registration page
│   ├── globals.css           # Global styles with Tailwind v4
│   ├── layout.tsx            # Root layout with auth provider
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── auth/                 # Authentication components
│   │   └── ProtectedRoute.tsx # Route protection component
│   ├── notes/                # Note-related components
│   │   ├── NoteCard.tsx      # Individual note display
│   │   ├── NoteForm.tsx      # Create/edit note form
│   │   ├── NotesList.tsx     # Notes list with search
│   │   └── ShareButton.tsx   # Note sharing functionality
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx        # Custom button component
│   │   ├── ChatButton.tsx    # AI chat trigger button
│   │   ├── ChatPanel.tsx     # AI chat interface
│   │   ├── Input.tsx         # Form input component
│   │   └── TextArea.tsx      # Text area component
│   ├── FirebaseInitializer.tsx # Firebase initialization
│   ├── Hero.tsx              # Landing page hero section
│   └── Navbar.tsx            # Navigation with session expiry warning
├── hooks/                    # Custom React hooks
│   ├── useAuth.tsx           # Authentication with session management
│   └── useNotes.tsx          # Notes CRUD operations
├── lib/                      # Library code
│   ├── firebase/             # Firebase services
│   │   ├── auth.ts           # Authentication functions
│   │   ├── firebase.ts       # Firebase initialization
│   │   ├── init.ts           # Hardcoded user setup
│   │   ├── notes.ts          # Notes CRUD operations
│   │   └── tokenManager.ts   # Session expiration (15 min)
│   └── utils/                # Utility functions
│       ├── config.ts         # Configuration helpers
│       └── rateLimiter.ts    # API rate limiting
├── utils/                    # Shared utilities
│   └── validations.ts        # Zod validation schemas
└── __tests__/                # Test files
    ├── auth.test.tsx         # Authentication tests
    ├── notes.test.tsx        # Notes functionality tests
    ├── mocks/                # Test mocks
    └── utils/                # Test utilities
```

## API Routes

The application includes server-side API routes for AI integration:

### POST /api/chat

AI writing assistant powered by Google Gemini.

**Request Body:**
```json
{
  "message": "Help me improve this note",
  "notes": {
    "currentNote": "My note content..."
  }
}
```

**Rate Limits:**
- 5 requests per minute
- 20 requests per day per IP

**Response:**
```json
{
  "response": "Here's an improved version..."
}
```

### GET /api/test-gemini

Test endpoint to verify Gemini API connectivity.

**Response:**
```json
{
  "success": true,
  "message": "Gemini API is working correctly"
}
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

### Deploy to Vercel

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `cur8-notely` project

3. **Configure Environment Variables:**
   Add the following environment variables in Vercel:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   GEMINI_API_KEY
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be live at `https://your-project.vercel.app`

### Production Checklist

Before deploying to production:

- [ ] Firebase project is configured with production rules
- [ ] Environment variables are set correctly
- [ ] Firestore security rules are deployed
- [ ] Authentication methods are enabled
- [ ] API rate limits are configured appropriately
- [ ] Production build runs successfully locally

## Trade-offs and Production Improvements

With more time, the following improvements could be made:

1. **Server-Side Session Management**: Implement server-side session validation in addition to client-side
2. **Refresh Tokens**: Use Firebase refresh tokens for more secure session management
3. **Comprehensive Testing**: Add comprehensive unit and integration tests with higher coverage
4. **Offline Support**: Implement offline capabilities with service workers and local storage
5. **Multi-user Collaboration**: Allow sharing and collaboration on notes in real-time
6. **End-to-End Encryption**: Implement client-side encryption for maximum security
7. **Password Policies**: Enforce stronger password requirements
8. **CAPTCHA Integration**: Add CAPTCHA to prevent automated attacks
9. **Note Versioning**: Add version history for notes with undo/redo capabilities
10. **Advanced Search**: Implement full-text search with filtering and sorting options
11. **Mobile App**: Build native mobile applications for iOS and Android
12. **Backup System**: Automated backup and restore functionality for user data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Security Best Practices

This application implements several security best practices:

1. **Environment Variables**: All API keys and sensitive configuration values are stored in environment variables and accessed securely.
2. **Server-Only API Keys**: The Gemini API key is only used on the server side and never exposed to the client.
3. **Firebase Security Rules**: Firestore security rules ensure users can only access their own data.
4. **Authentication**: Firebase Authentication handles secure user management.
5. **Session Management**: Automatic session expiration provides additional security.
6. **Rate Limiting**: API endpoints are protected with rate limiting to prevent abuse (5 req/min, 20 req/day).
7. **Input Validation**: All user inputs are validated using Zod schemas.
8. **CORS Protection**: API routes implement proper CORS headers.
