
import React from "react";

interface TypingIndicatorProps {
  isTyping: boolean;
  username?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  username = "Someone",
}) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in mt-2 mb-1">
      <div className="flex items-center space-x-1 mr-2">
        <div className="h-2 w-2 rounded-full bg-liveroom-gray animate-bounce-dot-1"></div>
        <div className="h-2 w-2 rounded-full bg-liveroom-gray animate-bounce-dot-2"></div>
        <div className="h-2 w-2 rounded-full bg-liveroom-gray animate-bounce-dot-3"></div>
      </div>
      <span className="italic">{username} is typing...</span>
    </div>
  );
};

export default TypingIndicator;
