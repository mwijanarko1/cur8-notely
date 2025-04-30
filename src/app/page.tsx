'use client';

import { useRouter } from 'next/navigation';
import { FiLock, FiFileText, FiCheck } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/notes');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero section */}
      <section className="flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Secure & Private
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900">Take Notes with</span>
                  <span className="block text-blue-600">Complete Security</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Cur8 Notely provides a simple and secure way to store your notes. With end-to-end encryption and user authentication, your notes are only accessible to you.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handleGetStarted}
                      isLoading={loading}
                    >
                      {user ? 'Go to My Notes' : 'Get Started'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <div className="p-8">
                    <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiFileText className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">Your notes are safe with us</h3>
                      <p className="mt-2 text-sm text-gray-500">Access your notes from anywhere, anytime, with complete peace of mind.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to keep notes
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Cur8 Notely combines security with simplicity to give you the best note-taking experience.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <FiLock className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Authentication</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Your notes are protected by industry-standard authentication mechanisms, ensuring only you can access them.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <FiFileText className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Simple Organization</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Easily create, edit, and organize your notes with our intuitive interface.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <FiCheck className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Real-time Updates</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Your notes are synced in real-time, ensuring you always have the latest version.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Customizable</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create notes that fit your needs, whether they&apos;re short reminders or detailed documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} Cur8 Notely. All rights reserved.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Built by <a href="https://twitter.com/mikhailbuilds" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@mikhailbuilds</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
