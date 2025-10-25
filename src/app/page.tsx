// File: src/app/page.tsx - CONTENT-RESIZING DRAWER VERSION

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Drawer } from '@mui/material';

// Our custom components
import ChatInput from '@/components/ChatInput';
import MessageBubble, { Message } from '@/components/MessageBubble';
import DisclaimerModal from '@/components/DisclaimerModal';
import TypingIndicator from '@/components/TypingIndicator';
import EmptyChat from '@/components/EmptyChat';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';

const DRAWER_WIDTH = 280; // Define a constant for the drawer width

export default function Home() {
  const { session, isSidebarOpen, toggleSidebar } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effects and handlers remain the same...
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const disclaimerAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (!disclaimerAcknowledged) {
      setModalOpen(true);
    }
  }, []);

  // Add this new useEffect hook inside the Home component in src/app/page.tsx

useEffect(() => {
  // This function fetches the messages for a selected chat.
  const fetchMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages.');
      }
      const data = await response.json();

      // The API returns messages with 'role' and 'content'.
      // We need to map them into the format our MessageBubble expects, adding a unique ID.
      const formattedMessages: Message[] = data.map((msg: any, index: number) => ({
        id: Date.now() + index, // Create a simple unique ID for the key prop
        role: msg.role,
        content: msg.content,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error(error);
      // You could set an error state here to show a message to the user
    } finally {
      setIsTyping(false); // Hide the loading indicator
    }
  };

  // If an existing conversation is selected, fetch its messages.
  if (activeConversationId) {
    fetchMessages(activeConversationId);
  } else {
    // If it's a new chat (ID is null), just ensure messages are cleared and there's no loading indicator.
    setMessages([]);
    setIsTyping(false);
  }
}, [activeConversationId]); // <-- This effect re-runs every time the user clicks a different chat.
 

  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };

  // Find the existing handleSendMessage in src/app/page.tsx and REPLACE it with this entire function.

const handleSendMessage = async (text: string) => {
  // --- 1. Optimistic UI Update ---
  // Immediately add the user's message to the state so it appears on screen.
  const newUserMessage: Message = { id: Date.now(), content: text, role: 'user' };
  setMessages((prevMessages) => [...prevMessages, newUserMessage]);
  setIsTyping(true);

  let currentConversationId = activeConversationId;
  let isNewConversation = !activeConversationId;

  try {
    // --- 2. Handle a BRAND NEW Conversation ---
    if (isNewConversation) {
      // Create a simple title from the first message
      const title = text.split(' ').slice(0, 5).join(' ') + '...';

      // API call to create the new conversation record
      const convResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!convResponse.ok) throw new Error('Failed to create conversation.');
      
      const newConversation = await convResponse.json();
      currentConversationId = newConversation.id;
      setActiveConversationId(newConversation.id); // Set this as the active chat
    }

    // --- 3. Save the User's Message ---
    // Now we have a conversation ID, whether it's new or existing.
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: currentConversationId,
        content: text,
        role: 'user',
      }),
    });

    // --- 4. Get the AI Response (from your simulated API) ---
    const aiResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!aiResponse.ok) throw new Error('Failed to get AI response.');
    
    const aiData = await aiResponse.json();
    setIsTyping(false);

    // --- 5. Save the AI's Message ---
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: currentConversationId,
        content: aiData.answer,
        role: 'assistant',
      }),
    });

    // --- 6. Stream the AI response to the UI ---
    const assistantMessageId = Date.now() + 1;
    const initialAssistantMessage: Message = { id: assistantMessageId, content: "", role: 'assistant' };
    setMessages((prevMessages) => [...prevMessages, initialAssistantMessage]);

    // Streaming logic remains the same as before
    const fullText = aiData.answer;
    let currentCharIndex = 0;
    const interval = setInterval(() => {
      if (currentCharIndex >= fullText.length) {
        clearInterval(interval);
        if (aiData.severity === 'critical') {
          // This logic also remains the same
        }
        return;
      }
      setMessages((prevMessages) => prevMessages.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: fullText.substring(0, currentCharIndex + 1) } 
          : msg
      ));
      currentCharIndex++;
    }, 25);

  } catch (error) {
    console.error("Error in handleSendMessage:", error);
    setIsTyping(false);
    // You could add an error message to the UI here
  }
};

  const handleSelectChat = (id: string) => {
  setMessages([]); // Clear previous messages immediately
  setIsTyping(true); // Show a loading indicator
  setActiveConversationId(id);
  };

  const handleNewChat = () => {
    console.log("Starting new chat");
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleRefreshConversations = (deletedId?: string) => {
  setRefreshKey(prevKey => prevKey + 1); // Trigger a refresh in the sidebar
  // If the chat that was just deleted is the one we are currently viewing...
  if (activeConversationId === deletedId) {
    setActiveConversationId(null); // ...then reset to the new chat screen.
    setMessages([]);
  }
};

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
      <DisclaimerModal open={modalOpen} onClose={handleCloseModal} />

      {/* --- SIDEBAR DRAWER --- */}
      {/* It's always "permanent" in the DOM, but we control its visibility */}
      <Drawer
        variant="persistent" // <-- The key change!
        anchor="left"
        open={isSidebarOpen && !!session} // <-- Controlled by our global state
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: '65px',
            height: 'calc(100% - 65px)',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <ChatHistorySidebar
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshConversations={handleRefreshConversations} 
        />
      </Drawer>

      {/* --- MAIN CONTENT WRAPPER --- */}
      {/* This Box will smoothly transition its margin */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: `-${DRAWER_WIDTH}px`, // Initially hidden off-screen
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isSidebarOpen && !!session && {
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0, // Slide into view
          }),
        }}
      >
        <div className="flex flex-col h-full max-w-4xl mx-auto flex-1">
          {/* ... rest of the chat content layout remains the same ... */}
          {messages.length === 0 && !isTyping ? (
            <div className="flex-1 flex flex-col justify-center items-center p-4">
              <div className="w-full">
                <EmptyChat />
                <div className="mt-8">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
              <div className="p-4 bg-white border-t">
                <ChatInput onSendMessage={handleSendMessage} />
              </div>
            </>
          )}
        </div>
      </Box>
    </Box>
  );
}