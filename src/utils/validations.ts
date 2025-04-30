import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .refine(value => value === 'intern' || value.includes('@'), {
      message: 'Please enter a valid email address',
    }),
  password: z.string()
    .min(1, { message: 'Password is required' })
});

// Registration form validation schema
export const registerSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
    .min(1, { message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Note form validation schema
export const noteSchema = z.object({
  title: z.string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title cannot exceed 100 characters' }),
  content: z.string()
    .min(1, { message: 'Content is required' })
}); 