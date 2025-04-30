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
import { db } from './firebase';
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

  return addDoc(collection(db, NOTES_COLLECTION), {
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

  const q = query(
    collection(db, NOTES_COLLECTION),
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

  const q = query(
    collection(db, NOTES_COLLECTION),
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

  const noteRef = doc(db, NOTES_COLLECTION, noteId);
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

  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  return deleteDoc(noteRef);
}; 