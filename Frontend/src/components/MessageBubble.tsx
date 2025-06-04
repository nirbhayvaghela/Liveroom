import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaFile } from "./MediaPreview";
import { format } from "date-fns";
import { SessionStorageGetItem } from "@/utils/helpers";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      image?: string;
      user_name?: string;
    };
    timestamp: Date;
    isCurrentUser: boolean;
    media?: MediaFile[];
    createdAt: Date;
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

  const isCurrentUser =
    SessionStorageGetItem("userData")?.id === message?.sender?.id;

  return (
    <div
      className={`flex items-start gap-2 mb-4 animate-fade-in ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="h-8 w-8">
        {message?.sender.image ? (
          <AvatarImage
            src={message?.sender.image}
            alt={message?.sender.user_name}
          />
        ) : (
          <AvatarFallback className="bg-liveroom-purple text-white">
            {getInitials(message?.sender.user_name)}
          </AvatarFallback>
        )}
      </Avatar>

      <div
        className={`flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div className=" flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium ${
              isCurrentUser ? "order-last" : ""
            }`}
          >
            {message?.sender.user_name}
          </span>
          <span className="text-xs text-gray-500">
            {format(message.createdAt, "h:mm a")}
          </span>
        </div>

        <div
          className={`px-3 py-2 rounded-lg text-white break-words max-w-[80%] ${
            isCurrentUser
              ? "bg-liveroom-purple self-end"
              : "bg-gray-700 self-start"
          }`}
        >
          {message?.content}

          {message?.media && message?.media.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message?.media.map((file) => (
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
