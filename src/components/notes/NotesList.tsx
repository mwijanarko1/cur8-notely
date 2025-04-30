'use client';

import { useState } from 'react';
import { FiPlus, FiSearch, FiFileText } from 'react-icons/fi';
import { Note } from '@/lib/firebase/notes';
import Button from '@/components/ui/Button';
import NoteCard from './NoteCard';

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export default function NotesList({
  notes,
  isLoading,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: NotesListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
        <div className="flex items-center w-full sm:w-auto gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={onAddNote}
          >
            Add Note
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          {notes.length === 0 ? (
            <>
              <FiFileText className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No notes yet</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Create your first note to get started with SecureNotes
              </p>
              <Button variant="primary" onClick={onAddNote} icon={<FiPlus />}>
                Create Your First Note
              </Button>
            </>
          ) : (
            <>
              <FiSearch className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No matching notes</h2>
              <p className="text-gray-500 mb-4">
                No notes match your search criteria
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={onDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
} 