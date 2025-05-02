import React, { useEffect, useState } from 'react';
import { getNotes } from '@/lib/firebase/notes';
import { User } from 'firebase/auth';
import { mockUser } from '../utils/test-utils';

const NotesList = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = mockUser; // This would normally come from auth context

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const fetchedNotes = await getNotes(user as User);
        setNotes(fetchedNotes);
      } catch (err) {
        setError('Failed to load notes');
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (!user) {
    return <div>Please log in to view your notes</div>;
  }

  if (notes.length === 0) {
    return <div>No notes found. Create your first note!</div>;
  }

  return (
    <div>
      {notes.map((note) => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesList; 