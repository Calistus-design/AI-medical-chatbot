// File: src/app/chat/[[...conversationId]]/page.tsx (Fully Merged and Corrected)

'use client';

import { useState, useEffect, useRef } from 'react';
// 1. IMPORT the necessary hooks from Next.js and Auth
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Box, Drawer, Typography, CircularProgress } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';

// Custom components (All your original components are here)
import ChatInput from '@/components/ChatInput';
import MessageBubble, { Message } from '@/components/MessageBubble';
import DisclaimerModal from '@/components/DisclaimerModal';
import TypingIndicator from '@/components/TypingIndicator';
import EmptyChat from '@/components/EmptyChat';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import EmergencyButton from '@/components/EmergencyButton';
import ScrollToBottomButton from '@/components/ScrollToBottomButton';

const DRAWER_WIDTH = 280;

export default function ChatPage() {
  // 2. INITIALIZE hooks
  const { isSidebarOpen, toggleSidebar } = useAuth();
  const router = useRouter();
  const params = useParams();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  // 'activeConversationId' is now a separate state that we sync with the URL
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(!!params.conversationId);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs and MUI Hooks (from your original code)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- EFFECT 1: Sync State FROM URL ---
  // This runs when the URL parameter changes (e.g., page load, navigation).
  useEffect(() => {
    const urlConvId = params.conversationId ? (params.conversationId[0] as string) : null;
    setActiveConversationId(urlConvId); // Sync our state with the URL

    const loadChatHistory = async () => {
      if (urlConvId) {
        setMessages([]); // Clear old messages before loading new ones
        setIsTyping(true);
        try {
          const res = await fetch(`/api/conversations/${urlConvId}`);
          if (!res.ok) throw new Error('Failed to fetch messages');
          const data = await res.json();
          const formatted = data.map((m: any, i: number) => {
            // If the flag is true, create a message with the EmergencyButton component
            if (m.is_emergency_prompt) {
              return { id: Date.now() + i, role: 'assistant', content: <EmergencyButton /> };
            }
            // Otherwise, it's just a normal text message
            return { id: Date.now() + i, role: m.role, content: m.content };
          });
          
          setMessages(formatted);
        } catch (error) {
          console.error("Failed to load chat history:", error);
          router.replace('/chat'); // If ID is bad, go to a new chat
        } finally {
          setIsTyping(false);
        }
      } else {
        // If there is no ID in the URL, it's a new chat. Clear the messages.
        setMessages([]);
      }
    };

    loadChatHistory();
  }, [params.conversationId, router]);

  // --- EFFECT 2: Sync URL FROM State ---
  // This runs when a new chat is created to update the URL without reloading.
  useEffect(() => {
    const urlConvId = params.conversationId ? (params.conversationId[0] as string) : null;
    if (activeConversationId && !urlConvId) {
      window.history.replaceState(null, '', `/chat/${activeConversationId}`);
    }
  }, [activeConversationId, params.conversationId]);

  // All your original helper useEffects are preserved
  // --- ADD THESE THREE BLOCKS ---

  // 1. A reusable function to scroll to the bottom
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  // 2. A handler that runs whenever the user scrolls
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  // 3. The new "smart" useEffect for auto-scrolling
  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom('auto');
    }
  }, [messages, showScrollButton]);

  useEffect(() => {
    const seen = sessionStorage.getItem('disclaimerAcknowledged');
    if (!seen) setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };

  // --- THE NEW, CORRECTED Send Message Handler ---
  // File: src/app/chat/[[...conversationId]]/page.tsx

  // --- REPLACE THE ENTIRE handleSendMessage FUNCTION WITH THIS ---

  // File: src/app/chat/[[...conversationId]]/page.tsx

  // --- REPLACE THE ENTIRE handleSendMessage FUNCTION WITH THIS ---

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = { id: Date.now(), content: text, role: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    scrollToBottom('smooth');
    setIsTyping(true);

    let conversationIdToUpdate = activeConversationId;

    try {
      // 1. Create conversation if it's the first message
      if (!conversationIdToUpdate) {
        const convRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: text.substring(0, 30) + '...' }),
        });
        const newConv = await convRes.json();
        conversationIdToUpdate = newConv.id;
        setActiveConversationId(conversationIdToUpdate);
      }
      
      // 2. Save the user's message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationIdToUpdate, content: text, role: 'user' }),
      });

      // 3. Prepare history and get the full AI response
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : 'UI element',
      }));

      const aiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const aiData = await aiRes.json();
      const fullText = aiData.answer || '';
      const showModal = aiData.show_hospital_modal;

      // All API calls are done. We can stop the typing indicator.
      setIsTyping(false);

      // --- 4. NEW LOGIC: HANDLE THE MODAL FIRST ---
      if (showModal && conversationIdToUpdate) {
        // A. Add the button to the UI immediately.
        const emergencyMessage: Message = { id: Date.now() + 1, content: <EmergencyButton />, role: 'assistant' };
        setMessages((prev) => [...prev, emergencyMessage]);
        
        // B. Save this "emergency prompt" message to the database.
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationIdToUpdate,
            content: 'EMERGENCY_PROMPT',
            role: 'assistant',
            is_emergency_prompt: true,
          }),
        });
      }

      // 5. Save the AI's TEXT response to the database
      // This happens whether the modal is shown or not.
      if (fullText && conversationIdToUpdate) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationIdToUpdate,
            content: fullText,
            role: 'assistant',
            is_emergency_prompt: false,
          }),
        });
      }

      // --- 6. HANDLE THE TEXT STREAMING ANIMATION (now happens last) ---
      const assistantId = Date.now() + 2; // Use a new ID
      setMessages((prev) => [...prev, { id: assistantId, content: '', role: 'assistant' }]);
      if (streamRef.current) clearInterval(streamRef.current);
      let idx = 0;
      streamRef.current = setInterval(() => {
        if (idx >= fullText.length) {
          clearInterval(streamRef.current!);
          handleRefreshConversations();
          return;
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText.substring(0, idx + 1) } : m))
        );
        idx++;
      }, 1);

    } catch (err: unknown) {
      console.error('SendMessage error:', err);
      setIsTyping(false);
    }
  };

  // --- NEW, SIMPLIFIED NAVIGATION HANDLERS ---
  const handleSelectChat = (id: string) => {
    router.push(`/chat/${id}`);
    if (isSidebarOpen && isMobile) toggleSidebar();
  };

  const handleNewChat = () => {
    router.push('/chat');
    if (isSidebarOpen && isMobile) toggleSidebar();
  };

  const handleRefreshConversations = (deletedId?: string) => {
    setRefreshKey((p) => p + 1);
    if (activeConversationId === deletedId) {
      router.push('/chat');
    }
  };

  // --- RENDER (Your original JSX, fully preserved) ---
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
      <DisclaimerModal open={modalOpen} onClose={handleCloseModal} />

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
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
            backgroundColor: 'white',
          },
        }}
      >
        <ChatHistorySidebar
          key={refreshKey}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshConversations={handleRefreshConversations}
        />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: !isMobile ? `-${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isSidebarOpen && !isMobile && {
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
          }),
        }}
      >
       <div className="flex flex-col h-full max-w-4xl mx-auto flex-1 w-full">
      {/* --- THIS IS THE NEW, CORRECTED LOGIC --- */}
      
      {/* STATE 1: Initial Loading. Show a spinner. */}
      {isTyping && messages.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : 
      
      /* STATE 2: Truly Empty Chat. Show the welcome screen. */
      messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-4 animate-fade-in-up">
          <EmptyChat />
          <div className="mt-8 w-full">
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
          </div>
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            This AI provides guidance and is not a substitute for professional medical advice. For emergencies, call your local emergency number.
          </Typography>
        </div>
      ) : (
      
      /* STATE 3: Active Chat with Messages. Show the conversation. */
        <>
          <div 
            ref={chatContainerRef} 
            onScroll={handleScroll} 
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isTyping && <TypingIndicator />}
            
            <div className="h-44 flex-shrink-0" />
            
            <ScrollToBottomButton isVisible={showScrollButton} onClick={() => scrollToBottom('smooth')} />
          </div>
          <div className="p-4 bg-white border-t shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.02)]">
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1.5, display: 'block' }}
            >
              This AI provides guidance and is not a substitute for professional medical advice. For emergencies, call your local emergency number.
            </Typography>
          </div>
        </>
      )}
    </div>
      </Box>
    </Box>
  );
}