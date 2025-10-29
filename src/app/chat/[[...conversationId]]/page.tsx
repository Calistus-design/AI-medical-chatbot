// File: src/app/chat/[[...conversationId]]/page.tsx

'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, Drawer } from '@mui/material';

// Our custom components
import ChatInput from '@/components/ChatInput';
import MessageBubble, { Message } from '@/components/MessageBubble';
import DisclaimerModal from '@/components/DisclaimerModal';
import TypingIndicator from '@/components/TypingIndicator';
import EmptyChat from '@/components/EmptyChat';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import EmergencyButton from '@/components/EmergencyButton';

const DRAWER_WIDTH = 280;

// This component now receives 'params' from the URL
export default function ChatPage({ params: paramsProp }: { params: Promise<{ conversationId?: string[] }> }) {
  const params = use(paramsProp);
  const { session, isSidebarOpen, toggleSidebar } = useAuth();
  const router = useRouter();

  // The active ID is now initialized directly from the URL params
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => params.conversationId?.[0] || null
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Effect to show the disclaimer modal on first visit
  useEffect(() => {
    const disclaimerAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (!disclaimerAcknowledged) {
      setModalOpen(true);
    }
  }, []);
  
  // Effect to fetch messages when the active conversation ID changes (due to URL change)
  // In src/app/chat/[[...conversationId]]/page.tsx

useEffect(() => {
  const fetchInitialMessages = async (id: string) => {
    // Only run if there are no messages currently displayed
    if (messages.length === 0) {
      setIsTyping(true);
      try {
        const response = await fetch(`/api/conversations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch initial messages.');
        const data = await response.json();
        const formattedMessages: Message[] = data.map((msg: any, index: number) => ({
          id: Date.now() + index,
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
        setActiveConversationId(id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const idFromParams = params.conversationId?.[0] || null;

  if (idFromParams) {
    fetchInitialMessages(idFromParams);
  }
  // We remove the 'else' block that was clearing the messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params.conversationId]); // We leave the dependency array like this intentionally

  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = { id: Date.now(), content: text, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsTyping(true);

    let conversationIdToUpdate = activeConversationId;

    try {
      if (!conversationIdToUpdate) {
        const title = text.split(' ').slice(0, 5).join(' ') + '...';
        const convResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!convResponse.ok) throw new Error('Failed to create conversation.');
        
        const newConversation = await convResponse.json();
        conversationIdToUpdate = newConversation.id;

        // Update the URL without a full page reload
        router.replace(`/chat/${conversationIdToUpdate}`);
        setActiveConversationId(conversationIdToUpdate);
      }

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationIdToUpdate,
          content: text,
          role: 'user',
        }),
      });

      // This is the new fetch call that includes the history

// First, prepare the history array.
// We take the current `messages` from our state and slice the last 6 items.
// Then, we map it to the format the AI expects: { role, content }.
const historyToSend = messages.slice(-6).map(msg => ({
  role: msg.role,
  content: typeof msg.content === 'string' ? msg.content : 'User interface element', // Ensure content is a string
}));

// Now, make the API call with the new body structure
const aiResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: text,      // The new user query
    history: historyToSend, // The recent conversation history
  }),
});
      if (!aiResponse.ok) throw new Error('Failed to get AI response.');
      
      const aiData = await aiResponse.json();
      console.log("DEBUG: Received AI Data from Next.js backend:", aiData);
      setIsTyping(false);

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationIdToUpdate,
          content: aiData.answer,
          role: 'assistant',
        }),
      });

      const assistantMessageId = Date.now() + 1;
      const initialAssistantMessage: Message = { id: assistantMessageId, content: "", role: 'assistant' };
      setMessages((prevMessages) => [...prevMessages, initialAssistantMessage]);

      const fullText = aiData.answer; // This is the AI's text response
const showModal = aiData.show_hospital_modal; // This is the new boolean flag

let currentCharIndex = 0;
const interval = setInterval(() => {
  if (currentCharIndex >= fullText.length) {
    clearInterval(interval); // Stop the streaming

    // --- THIS IS THE NEW LOGIC ---
    // After streaming is done, check the flag from the AI
    if (showModal === true) {
      console.log("AI signaled an emergency. Showing hospital button.");
      // Create and add the emergency button as a new message
      const emergencyMessage: Message = {
        id: Date.now() + 2,
        content: <EmergencyButton />,
        role: 'assistant',
      };
      setMessages((prevMessages) => [...prevMessages, emergencyMessage]);
    }
    // ----------------------------

    handleRefreshConversations(); // This is still needed to update the sidebar title
    return;
  }
  
  // This part of the streaming logic remains the same
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
    }
  };

  // In src/app/chat/[[...conversationId]]/page.tsx

const handleSelectChat = async (id: string) => {
  // 1. Navigate to the new URL
  router.push(`/chat/${id}`);
  if (isSidebarOpen) toggleSidebar();

  // 2. Take control of fetching messages directly
  setIsTyping(true);
  setMessages([]);
  try {
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch messages.');
    const data = await response.json();
    const formattedMessages: Message[] = data.map((msg: any, index: number) => ({
      id: Date.now() + index,
      role: msg.role,
      content: msg.content,
    }));
    setMessages(formattedMessages);
    setActiveConversationId(id);
  } catch (error) {
    console.error(error);
  } finally {
    setIsTyping(false);
  }
};

  const handleNewChat = () => {
  setActiveConversationId(null);
  setMessages([]);
  setIsTyping(false); // Make sure loading indicator is off
  router.push('/chat');
  if (isSidebarOpen) toggleSidebar();
};

  const handleRefreshConversations = (deletedId?: string) => {
    setRefreshKey(prevKey => prevKey + 1);
    if (activeConversationId === deletedId) {
      router.push('/chat');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
      <DisclaimerModal open={modalOpen} onClose={handleCloseModal} />

      {session && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={isSidebarOpen}
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
            key={refreshKey} // <-- This key makes the component re-fetch when it changes
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            refreshConversations={handleRefreshConversations}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: `-${DRAWER_WIDTH}px`,
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isSidebarOpen && session && {
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
          }),
        }}
      >
        <div className="flex flex-col h-full max-w-4xl mx-auto flex-1 w-full">
          {messages.length === 0 && !isTyping ? (
            <div className="flex-1 flex flex-col justify-center items-center p-4">
              <div className="w-full">
                <EmptyChat />
                <div className="mt-8">
                  <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
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
                <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
              </div>
            </>
          )}
        </div>
      </Box>
    </Box>
  );
}
