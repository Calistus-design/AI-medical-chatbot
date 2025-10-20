// File: src/components/ChatInput.tsx

'use client';

import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

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

  return (
    // We attach the handleSubmit function to the form's `onSubmit` event.
    <form
      onSubmit={handleSubmit}
      className="w-full flex items-center"
    >
      <textarea
        className="flex-1 resize-none border rounded-lg bg-transparent p-2 text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        rows={1}
      />
      <button
        type="submit"
        className="ml-2 p-2 rounded-full bg-action-green text-white hover:bg-green-700 disabled:bg-gray-400"
        disabled={!input.trim()}
      >
        <SendIcon />
      </button>
    </form>
  );
}