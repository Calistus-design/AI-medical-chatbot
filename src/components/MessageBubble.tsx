// File: src/components/MessageBubble.tsx


// File: src/components/MessageBubble.tsx
import ReactMarkdown from 'react-markdown'; // <-- ADD THIS LINE
// We're adding React.ReactNode to allow for more than just text
export interface Message {
  id: number;
  content: string | React.ReactNode; // Changed from 'text' to 'content'
  role: 'user' | 'assistant';
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const bubbleClasses = isUser
    ? 'bg-action-green text-white self-end'
    : 'bg-gray-200 text-dark-text self-start';

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';

  return (
    <div className={`w-full mb-2 ${wrapperClasses} animate-bubble-in`}>
      <div className={`p-3 rounded-lg max-w-2xl ${bubbleClasses}`}>
  {/* If the content is a string, render it as Markdown. Otherwise, render it directly. */}
  {typeof message.content === 'string' ? (
  <div className="prose prose-sm max-w-none">
    <ReactMarkdown>{message.content}</ReactMarkdown>
  </div>
) : (
  message.content
)}
</div>
    </div>
  );
}