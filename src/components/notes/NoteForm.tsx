'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiX } from 'react-icons/fi';
import { Note } from '@/lib/firebase/notes';
import { noteSchema } from '@/utils/validations';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';

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
  const formTitle = isEditing ? 'Edit Note' : 'Create Note';
  const buttonText = isEditing ? 'Update Note' : 'Create Note';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

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

  const handleFormSubmit = async (data: NoteFormValues) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        // Only reset if creating a new note
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{formTitle}</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close form"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Input
          label="Title"
          fullWidth
          error={errors.title?.message}
          {...register('title')}
          placeholder="Enter note title"
        />

        <TextArea
          label="Content"
          fullWidth
          rows={6}
          error={errors.content?.message}
          {...register('content')}
          placeholder="Enter note content"
          className="resize-none"
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
} 