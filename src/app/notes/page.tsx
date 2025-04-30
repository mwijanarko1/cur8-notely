'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/lib/firebase/notes';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotesList from '@/components/notes/NotesList';
import NoteForm from '@/components/notes/NoteForm';
import Navbar from '@/components/Navbar';

export default function NotesPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, editNote, removeNote } = useNotes({ user });
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNoteClick = () => {
    setEditingNote(null);
    setIsCreating(true);
  };

  const handleEditNoteClick = (note: Note) => {
    setEditingNote(note);
    setIsCreating(true);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleNoteSubmit = async (data: { title: string; content: string }) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        // Editing an existing note
        await editNote(editingNote.id, data);
      } else {
        // Creating a new note
        await addNote(data);
      }
      setIsCreating(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await removeNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isCreating ? (
            <NoteForm
              note={editingNote || undefined}
              onSubmit={handleNoteSubmit}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          ) : (
            <NotesList
              notes={notes}
              isLoading={loading}
              onAddNote={handleAddNoteClick}
              onEditNote={handleEditNoteClick}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </main>
        <footer className="py-4 text-center text-xs text-gray-500">
          <p>
            Cur8 Notely - Built by{' '}
            <a
              href="https://twitter.com/mikhailbuilds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              @mikhailbuilds
            </a>
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  );
} 