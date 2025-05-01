'use client';

import { useState, useEffect } from 'react';
import { IoMdChatbubbles } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import Button from './Button';
import ChatPanel from './ChatPanel';
import { Note } from '@/lib/firebase/notes';

type ChatButtonProps = {
  notes: Note[];
};

const ChatButton = ({ notes }: ChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotes, setHasNewNotes] = useState(false);
  const [notesCount, setNotesCount] = useState(0);

  // Track when notes change to show a notification dot
  useEffect(() => {
    if (notes.length > notesCount) {
      setHasNewNotes(true);
      setNotesCount(notes.length);
    }
  }, [notes.length, notesCount]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewNotes(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <div className="relative">
        <Button
          onClick={toggleChat}
          type="button"
          variant="primary"
          className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
            isOpen ? 'bg-gray-700' : 'bg-blue-600'
          }`}
        >
          {isOpen ? (
            <IoClose className="text-2xl" />
          ) : (
            <IoMdChatbubbles className="text-2xl" />
          )}
        </Button>
        
        {/* Notification Dot */}
        {hasNewNotes && !isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </div>

      {/* Chat Panel */}
      <div 
        className={`absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 transform ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-medium">Notely AI Assistant</h3>
          <div className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel notes={notes} />
        </div>
      </div>
    </div>
  );
};

export default ChatButton; 