# Cur8 Notely

A secure note-taking application with user authentication built with Next.js and Firebase. Built by [@mikhailbuilds](https://twitter.com/mikhailbuilds).

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Note Management**: Create, read, update, and delete personal notes
- **Real-time Updates**: Notes are updated in real-time using Firestore
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Search Functionality**: Quickly find notes with the built-in search feature

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Firebase (Authentication, Firestore)
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: TailwindCSS for responsive design
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cur8-notely.git
   cd cur8-notely
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Firebase Setup

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore services
3. Set up Firestore rules to secure user data

## Hardcoded User Credentials

For development and testing purposes, the application includes a hardcoded user as specified in the requirements:

- Username: `intern`
- Password: `letmein`

This user is automatically created in Firebase when the application initializes.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── login/                # Login page
│   ├── notes/                # Notes page (protected)
│   ├── register/             # Registration page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with auth provider
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── auth/                 # Authentication components
│   ├── notes/                # Note-related components
│   └── ui/                   # Reusable UI components
├── hooks/                    # Custom React hooks
│   ├── useAuth.tsx           # Authentication hook
│   └── useNotes.tsx          # Notes management hook
├── lib/                      # Library code
│   └── firebase/             # Firebase configuration and services
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions and helpers
    └── validations.ts        # Form validation schemas
```

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add your environment variables
4. Deploy!

## Testing

Run the tests with:

```bash
npm test
```

## Trade-offs and Future Improvements

With more time, the following improvements could be made:

1. **Comprehensive Testing**: Add comprehensive unit and integration tests
2. **Advanced Note Features**: Add rich text editing, tagging, and categories
3. **Offline Support**: Implement offline capabilities with service workers
4. **Multi-user Collaboration**: Allow sharing and collaboration on notes
5. **End-to-End Encryption**: Implement client-side encryption for maximum security

## License

This project is licensed under the MIT License - see the LICENSE file for details.
