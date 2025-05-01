'use client';

import { useState } from 'react';
import { FiPlus, FiSearch, FiFileText, FiTrash2 } from 'react-icons/fi';
import { Note } from '@/lib/firebase/notes';

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => Promise<void>;
  onViewNote: (note: Note) => void;
  selectedNoteId?: string;
}

export default function NotesList({
  notes,
  isLoading,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onViewNote,
  selectedNoteId,
}: NotesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort notes by updated date, newest first, but ensure welcome note is always first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Always keep welcome note at the top
    if (a.title === 'Welcome to Notely!') return -1;
    if (b.title === 'Welcome to Notely!') return 1;
    
    const dateA = a.updatedAt?.toDate ? new Date(a.updatedAt.toDate()).getTime() : 0;
    const dateB = b.updatedAt?.toDate ? new Date(b.updatedAt.toDate()).getTime() : 0;
    return dateB - dateA;
  });

  const handleDeleteClick = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent the note from being selected
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      setDeletingNoteId(noteId);
      try {
        await onDeleteNote(noteId);
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setDeletingNoteId(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-medium text-gray-800">Notes</h1>
          <button
            onClick={onAddNote}
            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
            aria-label="Create new note"
            title="Create new note"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <FiSearch className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-8 pr-3 py-1.5 w-full text-sm bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-300"></div>
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          {notes.length === 0 ? (
            <>
              <FiFileText className="h-10 w-10 text-gray-300 mb-3" />
              <h2 className="text-sm font-medium text-gray-600 mb-2">No Notes</h2>
              <p className="text-xs text-gray-500 mb-4 max-w-md">
                Click the + button to create your first note
              </p>
            </>
          ) : (
            <>
              <FiSearch className="h-10 w-10 text-gray-300 mb-3" />
              <h2 className="text-sm font-medium text-gray-600 mb-2">No Results</h2>
              <p className="text-xs text-gray-500 mb-2">
                Try a different search term
              </p>
              <button 
                className="text-xs text-blue-500 hover:text-blue-600"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          <ul className="divide-y divide-gray-100">
            {sortedNotes.map((note) => (
              <li 
                key={note.id}
                className={`relative hover:bg-gray-100 cursor-pointer transition-colors ${
                  selectedNoteId === note.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onViewNote(note)}
              >
                <div className="px-4 py-3 group">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 truncate pr-6">
                    {note.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="truncate">
                      {note.updatedAt?.toDate
                        ? new Date(note.updatedAt.toDate()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unknown date'}
                    </span>
                    <span className="mx-1">·</span>
                    <span className="truncate text-gray-400">{note.content.substring(0, 30)}{note.content.length > 30 ? '...' : ''}</span>
                  </div>
                  
                  {/* Delete button */}
                  <button 
                    className={`absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-all ${
                      selectedNoteId === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    onClick={(e) => handleDeleteClick(e, note.id)}
                    disabled={deletingNoteId === note.id}
                    title="Delete note"
                  >
                    {deletingNoteId === note.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 