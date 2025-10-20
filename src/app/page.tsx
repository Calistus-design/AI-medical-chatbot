// File: src/app/page.tsx - FINAL STREAMING VERSION

'use client';

import ChatInput from "@/components/ChatInput";
import MessageBubble, { Message } from "@/components/MessageBubble";
import DisclaimerModal from "@/components/DisclaimerModal";
import EmergencyButton from "@/components/EmergencyButton";
import TypingIndicator from "@/components/TypingIndicator";
import { useState, useEffect, useRef } from "react";
import { Typography } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- No changes to these functions ---
  useEffect(() => {
    const disclaimerAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (!disclaimerAcknowledged) {
      setModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };
  // --- End of unchanged functions ---


  // *** THIS IS THE MAJORLY UPGRADED FUNCTION ***
  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = {
      id: Date.now(),
      content: text,
      role: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    setIsTyping(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();
    
    setIsTyping(false);

    // --- START OF STREAMING LOGIC ---
    
    // 1. Create a new, empty message for the assistant
    const assistantMessageId = Date.now() + 1;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: "", // Start with empty content
      role: 'assistant',
    };
    setMessages((prevMessages) => [...prevMessages, initialAssistantMessage]);

    // 2. Simulate the stream
    const fullText = data.answer;
    let currentCharIndex = 0;
    const interval = setInterval(() => {
      // If we've "typed" out the whole message, stop the interval
      if (currentCharIndex >= fullText.length) {
        clearInterval(interval);
        
        // 3. After the stream is done, check for critical severity
        if (data.severity === 'critical') {
          const emergencyMessage: Message = {
            id: Date.now() + 2,
            content: <EmergencyButton />,
            role: 'assistant',
          };
          setMessages((prevMessages) => [...prevMessages, emergencyMessage]);
        }
        
        return;
      }
      
      // 4. Update the last message with one more character
      setMessages((prevMessages) => {
        // Find the last message (our assistant's message) and update its content
        return prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullText.substring(0, currentCharIndex + 1) } 
            : msg
        );
      });
      currentCharIndex++;
    }, 25); // Adjust this value to change typing speed (milliseconds)

    // --- END OF STREAMING LOGIC ---
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <DisclaimerModal open={modalOpen} onClose={handleCloseModal} />
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <div className="p-4 bg-white border-t">
        <ChatInput onSendMessage={handleSendMessage} />
        <Typography variant="caption" align="center" component="p" sx={{ color: 'grey.600', mt: 1 }}>
          This is an AI. For medical emergencies, call your local emergency number immediately.
        </Typography>
      </div>
    </div>
  );
}