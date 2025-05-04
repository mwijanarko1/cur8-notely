'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Note,
  createNote,
  updateNote,
  deleteNote,
  subscribeToNotes,
} from '@/lib/firebase/notes';

interface UseNotesOptions {
  user: User | null;
}

export function useNotes({ user }: UseNotesOptions) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to notes when user changes
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToNotes(user, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    // Clean up subscription when unmounting or when user changes
    return () => unsubscribe();
  }, [user]);

  // Create a new note
  const addNote = async (data: { title: string; content: string }) => {
    if (!user) {
      throw new Error('User must be authenticated to create notes');
    }

    try {
      await createNote(user, data);
      // No need to update state manually, as our subscription will handle it
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create note'));
      throw err;
    }
  };

  // Update an existing note
  const editNote = async (
    noteId: string,
    data: { title?: string; content?: string }
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update notes');
    }

    try {
      await updateNote(user, noteId, data);
      // No need to update state manually, as our subscription will handle it
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update note'));
      throw err;
    }
  };

  // Delete a note
  const removeNote = async (noteId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete notes');
    }

    try {
      await deleteNote(user, noteId);
      // No need to update state manually, as our subscription will handle it
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete note'));
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    editNote,
    removeNote
  };
} 