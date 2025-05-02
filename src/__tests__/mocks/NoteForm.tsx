import React, { useState } from 'react';
import { createNote } from '@/lib/firebase/notes';
import { User } from 'firebase/auth';

interface NoteFormProps {
  // Optional user prop for testing
  __test_user?: User | null;
}

const NoteForm = ({ __test_user }: NoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Use the test user if provided, otherwise null
  const user = __test_user || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('You must be logged in to create notes');
      setLoading(false);
      return;
    }

    try {
      await createNote(user as User, { title, content });
      setSuccess('Note created successfully!');
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError('Failed to create note. Please try again.');
      console.error('Create note error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-label="title"
        />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          aria-label="content"
        />
      </div>
      {error && <div role="alert">{error}</div>}
      {success && <div role="status">{success}</div>}
      <button type="submit" disabled={loading}>
        Save
      </button>
    </form>
  );
};

export default NoteForm; 