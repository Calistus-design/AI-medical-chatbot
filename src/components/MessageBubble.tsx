// File: src/components/MessageBubble.tsx

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
    <div className={`w-full mb-2 ${wrapperClasses}`}>
      <div className={`p-3 rounded-lg max-w-lg ${bubbleClasses}`}>
        {/* We now render 'content' which can be text or a component */}
        <div>{message.content}</div>
      </div>
    </div>
  );
}