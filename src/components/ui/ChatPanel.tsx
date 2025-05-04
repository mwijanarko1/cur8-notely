'use client';

import { useState, useEffect, useRef } from 'react';
import { IoSend } from 'react-icons/io5';
import { Note } from '@/lib/firebase/notes';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  pending?: boolean;
  timestamp: Date;
};

type ChatPanelProps = {
  notes: Note[];
};

const ChatPanel = ({ notes }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your AI assistant. Ask me anything about your notes.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number; resetAt: Date } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    // Small delay to ensure content has rendered
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Extract rate limit information from response headers
  const extractRateLimitInfo = (response: Response) => {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const limit = response.headers.get('X-RateLimit-Limit');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining && limit && reset) {
      setRateLimit({
        remaining: parseInt(remaining),
        limit: parseInt(limit),
        resetAt: new Date(parseInt(reset) * 1000)
      });
    }
  };

  // Test the Gemini API to ensure it's working
  const testGeminiApi = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-gemini');
      // Extract rate limit information
      extractRateLimitInfo(response);
      const data = await response.json();
      
      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const resetDate = new Date(data.resetAt);
          const resetInMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
          const resetMessage = resetInMinutes <= 1 
            ? 'Please try again in a minute.' 
            : `Please try again in ${resetInMinutes} minutes.`;
          
          throw new Error(`Rate limit exceeded. ${resetMessage}`);
        }
        
        throw new Error(data.error || 'Failed to test Gemini API');
      }
      
      // Add timestamp to message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `API Test: ${data.success ? 'Success' : 'Failed'}\n${data.response || ''}`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error('Error testing Gemini API:', error);
      setError(error.message || 'Failed to test Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAIResponse = (text: string) => {
    // Format lists
    let formatted = text.replace(/^\s*(\d+)\.\s+/gm, '<li class="ml-5 list-decimal">$1. ');
    formatted = formatted.replace(/^\s*[-*]\s+/gm, '<li class="ml-5 list-disc">');
    
    // Format headings
    formatted = formatted.replace(/^###\s+(.*?)$/gm, '<h3 class="font-bold text-lg mt-2 mb-1">$1</h3>');
    formatted = formatted.replace(/^##\s+(.*?)$/gm, '<h2 class="font-bold text-xl mt-3 mb-2">$1</h2>');
    formatted = formatted.replace(/^#\s+(.*?)$/gm, '<h1 class="font-bold text-2xl mt-4 mb-3">$1</h1>');
    
    // Format bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-2 rounded my-2 overflow-x-auto text-xs"><code>$1</code></pre>');
    
    // Format inline code
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
    
    // Format paragraphs (must come last)
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs.map(p => {
      if (
        !p.startsWith('<h') && 
        !p.startsWith('<pre') && 
        !p.startsWith('<li') &&
        p.trim().length > 0
      ) {
        return `<p class="mb-2">${p}</p>`;
      }
      return p;
    }).join('\n\n');
    
    return formatted;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    setError(null);
    
    // Add user message with timestamp
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      content: inputValue,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    
    // Add AI message with pending state and timestamp
    const aiMessageId = (Date.now() + 1).toString();
    const pendingMessage = {
      id: aiMessageId,
      content: '',
      sender: 'ai' as const,
      pending: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage, pendingMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get response from Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          notes: {
            currentNote: notes.map(note => 
              `Note Title: ${note.title}\nContent: ${note.content}`
            ).join('\n\n')
          },
        }),
      });
      
      // Extract rate limit information
      extractRateLimitInfo(response);

      const data = await response.json();
      
      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const resetDate = new Date(data.resetAt);
          const resetInMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
          const resetMessage = resetInMinutes <= 1 
            ? 'Please try again in a minute.' 
            : `Please try again in ${resetInMinutes} minutes.`;
          
          throw new Error(`Rate limit exceeded. ${resetMessage}`);
        }
        
        throw new Error(data.error || 'Failed to get response from AI');
      }
      
      // Update AI message with response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: data.response, pending: false } 
            : msg
        )
      );
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError(error.message || 'An unknown error occurred');
      
      // Update AI message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, I had trouble processing your request. Please try again.',
                pending: false 
              } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Timestamp */}
            <div className="text-xs text-gray-500 mb-1">
              {formatTime(message.timestamp)}
            </div>
            
            {/* Message Bubble */}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.pending ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              ) : message.sender === 'ai' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-600 text-xs">
          <p>Error: {error}</p>
          <button 
            onClick={testGeminiApi}
            className="underline text-blue-600 mt-1"
          >
            Test API Connection
          </button>
        </div>
      )}

      {/* Rate Limit Info */}
      {rateLimit && (
        <div className="px-3 py-1 bg-gray-50 text-gray-500 text-xs flex justify-between items-center">
          <span>
            {rateLimit.remaining} of {rateLimit.limit} requests remaining
          </span>
          {rateLimit.remaining < 5 && (
            <span>
              Resets in {Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} min
            </span>
          )}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-3 flex items-center"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask something about your notes..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`ml-2 p-2 rounded-full ${
            isLoading || !inputValue.trim()
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <IoSend />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel; 