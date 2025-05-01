'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/lib/firebase/notes';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotesList from '@/components/notes/NotesList';
import NoteForm from '@/components/notes/NoteForm';
import Navbar from '@/components/Navbar';
import ChatButton from '@/components/ui/ChatButton';

export default function NotesPage() {
  const { user, loading, resetSessionTimer } = useAuth();
  const { notes, addNote, editNote, removeNote } = useNotes({ user });
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setLocalTitle(selectedNote.title);
      setLocalContent(selectedNote.content);
    }
  }, [selectedNote]);

  const handleAddNoteClick = async () => {
    try {
      setIsSubmitting(true);
      // Create a new note with default values
      const newNote = {
        title: 'Untitled Note',
        content: ''
      };
      await addNote(newNote);
      
      // Flag for the useEffect to know we want to edit the new note
      setNewNoteId('pending');
      resetSessionTimer(); // Reset session timer on user interaction
    } catch (error) {
      console.error('Error creating new note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNoteClick = (note: Note) => {
    setEditingNote(note);
    setIsCreating(true);
    setSelectedNote(null);
    resetSessionTimer(); // Reset session timer on user interaction
  };

  const handleViewNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setEditingNote(null);
    resetSessionTimer(); // Reset session timer on user interaction
  };

  const handleCancelForm = () => {
    // When clicking back from edit mode, show the note that was being edited
    if (editingNote) {
      setSelectedNote(editingNote);
    }
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
        // Creating a new note - this is now handled directly in handleAddNoteClick
        await addNote(data);
      }
      resetSessionTimer(); // Reset session timer on user interaction
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await removeNote(noteId);
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
      if (editingNote && editingNote.id === noteId) {
        setEditingNote(null);
        setIsCreating(false);
      }
      resetSessionTimer(); // Reset session timer on user interaction
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Look for newly created note
  useEffect(() => {
    if (newNoteId === 'pending' && notes.length > 0) {
      // Find the most recently created note (assumes it's the one we just added)
      const sortedNotes = [...notes].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? new Date(a.createdAt.toDate()).getTime() : 0;
        const dateB = b.createdAt?.toDate ? new Date(b.createdAt.toDate()).getTime() : 0;
        return dateB - dateA;
      });
      
      if (sortedNotes.length > 0) {
        const mostRecentNote = sortedNotes[0];
        if (mostRecentNote.title === 'Untitled Note' && mostRecentNote.content === '') {
          // Set this note for editing
          setEditingNote(mostRecentNote);
          setIsCreating(true);
          setSelectedNote(null);
          setNewNoteId(mostRecentNote.id); // Store the actual ID to avoid re-triggering
        }
      }
    }
  }, [notes, newNoteId]);

  // Auto-select first note when notes load and nothing is selected
  useEffect(() => {
    if (notes.length > 0 && !selectedNote && !isCreating && !newNoteId) {
      const firstNote = notes[0];
      setSelectedNote(firstNote);
    }
  }, [notes, selectedNote, isCreating, newNoteId]);

  // Debounced save function to prevent too many saves
  const debouncedSave = useCallback(async () => {
    if (!selectedNote) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (selectedNote.title !== localTitle || selectedNote.content !== localContent) {
        setIsSubmitting(true);
        try {
          await editNote(selectedNote.id, { 
            title: localTitle, 
            content: localContent 
          });
          // No need to update selectedNote.title or selectedNote.content here
          // They will be updated by the subscription in useNotes
          resetSessionTimer(); // Reset session timer on user interaction
        } catch (error) {
          console.error('Error updating note:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }, 1000);
  }, [selectedNote, localTitle, localContent, editNote, resetSessionTimer]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    debouncedSave();
    resetSessionTimer(); // Reset session timer on user interaction
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    debouncedSave();
    resetSessionTimer(); // Reset session timer on user interaction
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col md:flex-row h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-full md:w-64 md:min-w-64 border-r border-gray-200 bg-[#f5f5f7] overflow-y-auto">
            <NotesList
              notes={notes}
              isLoading={loading}
              onAddNote={handleAddNoteClick}
              onEditNote={handleEditNoteClick}
              onDeleteNote={handleDeleteNote}
              onViewNote={handleViewNoteClick}
              selectedNoteId={selectedNote?.id}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-grow overflow-y-auto bg-white p-6">
            {isCreating ? (
              <NoteForm
                note={editingNote || undefined}
                onSubmit={handleNoteSubmit}
                onCancel={handleCancelForm}
                isSubmitting={isSubmitting}
              />
            ) : selectedNote ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <input
                    ref={titleInputRef}
                    type="text" 
                    value={localTitle}
                    onChange={handleTitleChange}
                    className="text-2xl font-semibold text-gray-800 w-full mr-4 border-0 bg-transparent focus:outline-none focus:ring-0"
                  />
                  <div className="flex space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          handleDeleteNote(selectedNote.id);
                        }
                      }}
                      className="px-4 py-2 text-sm rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <textarea
                    ref={contentInputRef}
                    value={localContent}
                    onChange={handleContentChange}
                    className="w-full h-full min-h-[300px] resize-none border-0 bg-transparent focus:outline-none focus:ring-0 whitespace-pre-line text-gray-700"
                    placeholder="Start typing..."
                  />
                </div>
                {isSubmitting && (
                  <div className="text-xs text-gray-400 pt-2 text-right">
                    Saving...
                  </div>
                )}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                  Last updated: {selectedNote.updatedAt?.toDate
                    ? new Date(selectedNote.updatedAt.toDate()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Unknown date'}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>Select a note or create a new one</p>
              </div>
            )}
          </div>
        </main>
        
        {/* AI Chat Assistant */}
        <ChatButton notes={notes} />
        
        <footer className="py-2 text-center text-xs text-gray-400 border-t border-gray-200">
          <p>
            Cur8 Notely - Built by{' '}
            <a
              href="https://mikhailwijanarko.xyz"
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