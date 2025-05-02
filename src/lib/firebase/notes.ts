import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, getFirestoreInstance } from './firebase';
import { User } from 'firebase/auth';

// Collection name
const NOTES_COLLECTION = 'notes';

// Note interface
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

// Create a new note
export const createNote = async (
  user: User,
  data: { title: string; content: string }
): Promise<DocumentReference> => {
  if (!user) {
    throw new Error('User must be authenticated to create notes');
  }

  const firestore = getFirestoreInstance();
  return addDoc(collection(firestore, NOTES_COLLECTION), {
    ...data,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get all notes for a user
export const getNotes = async (user: User): Promise<Note[]> => {
  if (!user) {
    throw new Error('User must be authenticated to fetch notes');
  }

  const firestore = getFirestoreInstance();
  const q = query(
    collection(firestore, NOTES_COLLECTION),
    where('userId', '==', user.uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const notes: Note[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    notes.push({
      id: doc.id,
      title: data.title,
      content: data.content,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userId: data.userId,
    });
  });

  return notes;
};

// Get real-time updates of notes for a user
export const subscribeToNotes = (
  user: User,
  callback: (notes: Note[]) => void
): Unsubscribe => {
  if (!user) {
    throw new Error('User must be authenticated to subscribe to notes');
  }

  try {
    const firestore = getFirestoreInstance();
    const q = query(
      collection(firestore, NOTES_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const notes: Note[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userId: data.userId,
        });
      });
      callback(notes);
    });
  } catch (error) {
    console.error('Error subscribing to notes:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

// Update a note
export const updateNote = async (
  user: User,
  noteId: string,
  data: { title?: string; content?: string }
): Promise<void> => {
  if (!user) {
    throw new Error('User must be authenticated to update notes');
  }

  const firestore = getFirestoreInstance();
  const noteRef = doc(firestore, NOTES_COLLECTION, noteId);
  return updateDoc(noteRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Delete a note
export const deleteNote = async (user: User, noteId: string): Promise<void> => {
  if (!user) {
    throw new Error('User must be authenticated to delete notes');
  }

  const firestore = getFirestoreInstance();
  const noteRef = doc(firestore, NOTES_COLLECTION, noteId);
  return deleteDoc(noteRef);
};

// Create a welcome note for new users
export const createWelcomeNote = async (user: User): Promise<DocumentReference> => {
  if (!user) {
    throw new Error('User must be authenticated to create welcome note');
  }

  const welcomeTitle = 'Welcome to Notely!';
  const welcomeContent = `Welcome to Notely! 🎉

Thank you for signing up! Notely is a simple, secure note-taking application built with privacy and ease of use in mind.

Features:
• Secure Authentication: Your notes are protected with Firebase Authentication
• Real-time Sync: All your notes are synchronized in real-time
• Fast & Responsive: Built with Next.js for optimal performance
• Session Management: Your session automatically expires after 15 minutes of inactivity for security

Getting Started:
1. Click the "+" button in the sidebar to create a new note
2. Give your note a title and start writing
3. Your changes are saved automatically as you type
4. Use the search function to quickly find your notes

About the Developer:
This application was built by Mikhail Wijanarko (https://mikhailwijanarko.xyz).
Check out more projects on GitHub: https://github.com/mwijanarko1

Enjoy using Notely for all your note-taking needs!`;

  return createNote(user, {
    title: welcomeTitle,
    content: welcomeContent
  });
}; 