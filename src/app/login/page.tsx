'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiAlertCircle, FiArrowLeft, FiInfo } from 'react-icons/fi';
import { loginSchema } from '@/utils/validations';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import { isFirebaseProperlyConfigured } from '@/lib/firebase/firebase';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSignInEnabled, setGoogleSignInEnabled] = useState(false);
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();

  // Check if Firebase is properly configured on mount
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const isProperlyConfigured = isFirebaseProperlyConfigured();
      setGoogleSignInEnabled(isProperlyConfigured);
      
      if (!isProperlyConfigured) {
        console.warn('Firebase is not properly configured with valid API keys. Google Sign-In is disabled.');
      }
    };
    
    checkFirebaseConfig();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      router.push('/notes');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setServerError('Invalid email or password. Please try again.');
            break;
          case 'auth/too-many-requests':
            setServerError('Too many failed login attempts. Please try again later.');
            break;
          case 'auth/user-disabled':
            setServerError('This account has been disabled. Please contact support.');
            break;
          default:
            setServerError('Failed to sign in. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setIsGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      router.push('/notes');
    } catch (error) {
      console.error('Google login error:', error);
      setServerError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-2">
          <Link 
            href="/" 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors" 
            aria-label="Back to home"
          >
            <FiArrowLeft className="mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="mt-2 text-gray-600">
            Access your Cur8 Notely account
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-sm text-red-600">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email or Username"
            type="text"
            fullWidth
            icon={<FiMail />}
            error={errors.email?.message}
            {...register('email')}
            placeholder="Enter your email or username"
          />

          <Input
            label="Password"
            type="password"
            fullWidth
            icon={<FiLock />}
            error={errors.password?.message}
            {...register('password')}
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500"
              >
                Need an account? Sign up
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {!googleSignInEnabled && (
            <div className="my-3 p-2 bg-yellow-50 border border-yellow-100 rounded-md flex items-start text-sm text-yellow-700">
              <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Google Sign-In is currently unavailable. Please use email/password login instead.</span>
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || !googleSignInEnabled}
              className={`w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm 
                ${googleSignInEnabled 
                  ? 'bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <div className="flex items-center">
                  <Image 
                    src="/google-logo.svg" 
                    alt="Google" 
                    width={18} 
                    height={18} 
                    className="mr-2" 
                  />
                  <span>Sign in with Google</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Built by <a href="https://mikhailwijanarko.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">@mikhailbuilds</a></p>
      </div>
    </div>
  );
} 