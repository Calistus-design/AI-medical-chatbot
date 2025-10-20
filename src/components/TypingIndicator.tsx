// File: src/components/TypingIndicator.tsx

import { Box } from '@mui/material';

export default function TypingIndicator() {
  const dotStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: 'grey.500',
    borderRadius: '50%',
    margin: '0 2px',
  };

  return (
    <div className="flex justify-start w-full mb-2">
      <div className="p-3 rounded-lg bg-gray-200 inline-flex items-center">
        {/* We use MUI's Box for styling and Tailwind-like animation */}
        <Box sx={{ ...dotStyle, animation: 'bounce 1.4s infinite ease-in-out both' }} />
        <Box sx={{ ...dotStyle, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
        <Box sx={{ ...dotStyle, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}