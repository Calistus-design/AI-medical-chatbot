// File: src/app/chat/[[...conversationId]]/page.tsx

'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, Drawer } from '@mui/material';

// Custom components
import ChatInput from '@/components/ChatInput';
import MessageBubble, { Message } from '@/components/MessageBubble';
import DisclaimerModal from '@/components/DisclaimerModal';
import TypingIndicator from '@/components/TypingIndicator';
import EmptyChat from '@/components/EmptyChat';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import EmergencyButton from '@/components/EmergencyButton';

const DRAWER_WIDTH = 280;

export default function ChatPage({
  params: paramsProp,
}: {
  params: Promise<{ conversationId?: string[] }>;
}) {
  const params = use(paramsProp);
  const { session, isSidebarOpen, toggleSidebar } = useAuth();
  const router = useRouter();

  // Core states
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => params.conversationId?.[0] || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // NEW: Prevent race condition between sendMessage and useEffect
  const [isManuallyUpdating, setIsManuallyUpdating] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const userMessagesCount = messages.filter(m => m.role === 'user').length; // <-- ADD THIS LINE

  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userMessagesCount]); // It only runs when the number of user messages changes

  // Auto-scroll when messages or typing state change
  useEffect(() => {
  if (chatContainerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // A buffer to account for small pixel differences. 20px is a safe number.
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;

    // Only auto-scroll if the user is already at or near the bottom.
    if (isAtBottom) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }
}, [messages, isTyping]);

  // Show disclaimer modal once per session
  useEffect(() => {
    const disclaimerAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (!disclaimerAcknowledged) setModalOpen(true);
  }, []);

  // ✅ FIXED USEEFFECT (prevents race condition)
 useEffect(() => {
  const idFromParams = params.conversationId?.[0] || null;

  const fetchMessages = async () => {
    if (!idFromParams || isManuallyUpdating) return; // Guard clause

    setIsTyping(true);
    try {
      const res = await fetch(`/api/conversations/${idFromParams}`);
      if (!res.ok) throw new Error('Failed to fetch messages.');
      const data = await res.json();

      let formattedMessages: Message[] = data.map((msg: any, index: number) => ({
        id: Date.now() + index,
        role: msg.role,
        content: msg.content,
      }));

      // --- THIS IS THE NEW LOGIC ---
      // After fetching, check if the LAST message requires the emergency button.
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        // We'll make a quick, lightweight call to our Next.js backend
        // to re-evaluate the seriousness of the last message.
        const seriousnessCheck = await fetch('/api/classify', { // A NEW API ROUTE
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: lastMessage.content }),
        });

        if (seriousnessCheck.ok) {
          const { is_serious } = await seriousnessCheck.json();
          if (is_serious) {
            console.log("Last message is serious, re-adding emergency button.");
            const emergencyMessage: Message = {
              id: Date.now() + formattedMessages.length,
              content: <EmergencyButton />,
              role: 'assistant',
            };
            // Add the button to the end of the loaded messages
            formattedMessages = [...formattedMessages, emergencyMessage];
          }
        }
      }
      // --- END OF NEW LOGIC ---

      setMessages(formattedMessages);
      setActiveConversationId(idFromParams);
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setIsTyping(false);
    }
  };

  fetchMessages();
}, [params.conversationId, isManuallyUpdating]);

  // Disclaimer close handler
  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };

  // Send message handler
  const handleSendMessage = async (text: string) => {
  const newUserMessage: Message = { id: Date.now(), content: text, role: 'user' };
  setMessages((prev) => [...prev, newUserMessage]);
  setIsTyping(true);
  setIsManuallyUpdating(true); // 👈 prevent useEffect from interfering

  let conversationIdToUpdate = activeConversationId;
  let newConversationCreated = false;

  try {
    // 1️⃣ Create new conversation if none exists
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
      newConversationCreated = true;

      // ⚠️ Do NOT update the URL yet — wait until AI finishes
      setActiveConversationId(conversationIdToUpdate);
    }

    // 2️⃣ Save user message
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationIdToUpdate,
        content: text,
        role: 'user',
      }),
    });

    // 3️⃣ Prepare last few messages as history
    const historyToSend = [...messages, newUserMessage].slice(-6).map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === 'string' ? msg.content : 'User interface element',
    }));

    // 4️⃣ Fetch AI response
    const aiResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: historyToSend,
      }),
    });
    if (!aiResponse.ok) throw new Error('Failed to get AI response.');

    const aiData = await aiResponse.json();
    const fullText = aiData.answer || '';
    const showModal = aiData.show_hospital_modal;
    setIsTyping(false);

    // 5️⃣ Save assistant message to DB
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationIdToUpdate,
        content: fullText,
        role: 'assistant',
      }),
    });

    // 6️⃣ Add assistant message placeholder for streaming effect
    const assistantMessageId = Date.now() + 1;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
    };
    setMessages((prev) => [...prev, initialAssistantMessage]);

    // 7️⃣ Simulate typing / streaming
    if (streamRef.current) clearInterval(streamRef.current);
    let currentCharIndex = 0;

    streamRef.current = setInterval(() => {
      if (currentCharIndex >= fullText.length) {
        clearInterval(streamRef.current!);

        // Optional: show modal (Emergency button)
        if (showModal === true) {
          const emergencyMessage: Message = {
            id: Date.now() + 2,
            content: <EmergencyButton />,
            role: 'assistant',
          };
          setMessages((prev) => [...prev, emergencyMessage]);
        }

        // ✅ Only now: update sidebar + allow useEffect + update URL
        handleRefreshConversations();
        setIsManuallyUpdating(false);

        // ⏳ Update the URL only *after* streaming completes
        if (newConversationCreated && conversationIdToUpdate) {
          router.replace(`/chat/${conversationIdToUpdate}`);
        }

        return;
      }

      // Stream characters into assistant message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: fullText.substring(0, currentCharIndex + 1),
              }
            : msg
        )
      );
      currentCharIndex++;
    }, 5);
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    setIsTyping(false);
    setIsManuallyUpdating(false);
  }
};


  // Select existing chat
  const handleSelectChat = async (id: string) => {
    router.push(`/chat/${id}`);
    if (isSidebarOpen) toggleSidebar();
    setIsTyping(true);
    setIsManuallyUpdating(true);
    setMessages([]);

    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch messages.');
      const data = await response.json();
      const formatted: Message[] = data.map((msg: any, index: number) => ({
        id: Date.now() + index,
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formatted);
      setActiveConversationId(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
      setIsManuallyUpdating(false);
    }
  };

  // Start a new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsTyping(false);
    router.push('/chat');
    if (isSidebarOpen) toggleSidebar();
  };

  // Refresh chat list
  const handleRefreshConversations = (deletedId?: string) => {
    setRefreshKey((prev) => prev + 1);
    if (activeConversationId === deletedId) router.push('/chat');
  };

  // ────────────────────────────────────────────────────────────────
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
            key={refreshKey}
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
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(isSidebarOpen &&
            session && {
              transition: (theme) =>
                theme.transitions.create('margin', {
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
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
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
