// File: src/components/ChatInput.tsx

'use client';

import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import TextareaAutosize from 'react-textarea-autosize';

// This defines the props (inputs) our component will accept.
// It needs a function called `onSendMessage` to call when the user sends a message.
interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  // THIS IS THE FUNCTION THAT WAS MISSING.
  // It handles the logic for when the form is submitted.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // This is crucial to prevent the page from reloading.
    if (input.trim()) {
      onSendMessage(input.trim()); // Call the function from the parent page.
      setInput(''); // Clear the input field after sending.
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if the Enter key is pressed AND the Shift key is NOT pressed
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action (adding a new line)
      handleSubmit(e as any); // Trigger the form submission
    }
  };

  // Check if the input contains a newline character. This is a reliable way
  // to know if the user is typing on more than one line.
  const isMultiLine = input.includes('\n');

  // Conditionally choose the border-radius class.
  const borderRadiusClass = isMultiLine ? 'rounded-2xl' : 'rounded-full';

return (
    // 1. The form is now a "relative" container, which acts as an anchor for the button.
    <form
      onSubmit={handleSubmit}
      className="w-full relative flex items-center"
    >
      {/* 2. The textarea is styled to be a rounded pill and has extra padding on the right */}
      <TextareaAutosize
        className={`w-full resize-none border ${borderRadiusClass} bg-transparent p-4 pr-14 text-lg 
        text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200`}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        minRows={1}
        maxRows={6}
      />
      
      {/* 3. The button is "absolutely" positioned inside the form container */}
      <button
        type="submit"
        className={`absolute right-3 ${isMultiLine ? 'bottom-3' : 'top-1/2 -translate-y-1/2'} p-2 
        rounded-full bg-action-green text-white hover:bg-green-700 disabled:bg-gray-400 
        disabled:cursor-not-allowed transition-all duration-200`}
        disabled={!input.trim()}
      >
        <SendIcon />
      </button>
    </form>
  );
}