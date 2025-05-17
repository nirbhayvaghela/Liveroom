
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaFile } from "./MediaPreview";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: Date;
    isCurrentUser: boolean;
    media?: MediaFile[];
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      className={`flex items-start gap-2 mb-4 animate-fade-in ${
        message.isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="h-8 w-8">
        {message.sender.avatar ? (
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
        ) : (
          <AvatarFallback className="bg-liveroom-purple text-white">
            {getInitials(message.sender.name)}
          </AvatarFallback>
        )}
      </Avatar>

      <div
        className={`flex flex-col ${
          message.isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium ${
              message.isCurrentUser ? "order-last" : ""
            }`}
          >
            {message.sender.name}
          </span>
          <span className="text-xs text-gray-500">
            {format(message.timestamp, "h:mm a")}
          </span>
        </div>

        <div
          className={
            message.isCurrentUser ? "message-bubble-user" : "message-bubble-other"
          }
        >
          {message.content}

          {message.media && message.media.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.media.map((file) => (
                <div key={file.id}>
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-h-40 rounded-md object-cover"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      controls
                      className="max-h-40 rounded-md"
                      src={file.url}
                    />
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md bg-background p-2 text-sm"
                    >
                      <span>{file.name}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
