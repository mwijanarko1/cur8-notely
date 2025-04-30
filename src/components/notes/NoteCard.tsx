'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { Note } from '@/lib/firebase/notes';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const dateFormatted = note.updatedAt?.toDate
    ? new Date(note.updatedAt.toDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown date';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(note.id);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Truncate content if it's too long
  const truncatedContent = note.content.length > 150
    ? `${note.content.substring(0, 150)}...`
    : note.content;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-800 break-words">{note.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Edit note"
          >
            <FiEdit2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Delete note"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="inline-block w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
            ) : (
              <FiTrash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Date line */}
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <FiCalendar className="mr-1" />
        <span>Last updated: {dateFormatted}</span>
      </div>
      
      {/* Content */}
      <div className="mt-4">
        <p className="text-gray-600 whitespace-pre-line break-words">{truncatedContent}</p>
      </div>
    </div>
  );
} 