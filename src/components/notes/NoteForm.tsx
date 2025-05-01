'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Note } from '@/lib/firebase/notes';
import { noteSchema } from '@/utils/validations';
import { FiArrowLeft } from 'react-icons/fi';

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: NoteFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function NoteForm({ 
  note, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: NoteFormProps) {
  const isEditing = !!note;
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  // Watch for changes to autosave
  const formValues = watch();

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
      });
    } else {
      reset({
        title: '',
        content: '',
      });
    }
  }, [note, reset]);

  // Auto-save when form is dirty (changes are made)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (isDirty && !isSubmitting) {
        handleSubmit(handleFormSubmit)();
      }
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(saveTimeout);
  }, [formValues, isDirty, isSubmitting]);

  const handleFormSubmit = async (data: NoteFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to notes"
            title="Back to notes"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">
            {isSubmitting ? 'Saving...' : 'Editing Note'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            className="w-full text-xl font-medium border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
            placeholder="Title"
            autoFocus
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="flex-grow">
          <textarea
            className="w-full h-full resize-none border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
            placeholder="Type something..."
            {...register('content')}
            rows={20}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>
        
        {isSubmitting && (
          <div className="text-xs text-gray-400 py-1 text-right">
            Saving...
          </div>
        )}
      </form>
    </div>
  );
} 