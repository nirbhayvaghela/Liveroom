import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Image, Send, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useApi } from "@/hooks/useApi";
import socket from "@/utils/socket";
import {
  getInitials,
  getRandomColor,
  LocalStorageGetItem,
} from "@/utils/helpers";
import { FiClipboard, FiCheck } from "react-icons/fi";
import MediaPreview, { MediaFile } from "@/components/MediaPreview";
import { Loader } from "@/components/ui/loader";
import ThemeToggle from "@/components/ThemeToggle";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatarGroup from "@/components/UserAvatarGroup";

interface ChatRoomProps {
  roomCode: string;
  username: string;
  onLeave: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomCode, username, onLeave }) => {
  const roomDetails = LocalStorageGetItem("userData")?.rooms;
  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [chat, setChat] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastInputTimeRef = useRef<number>(0);
  const isMobile = useIsMobile();

  const { getRoomUsers, getRoomChat, uploadFile } = useApi();

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && mediaFiles.length === 0) return;

    try {
      // Upload media files first if any
      const uploadedMediaUrls = [];
      console.log(mediaFiles, "cjhec");
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        formData.append("media", mediaFiles[0].file);

        const res = await uploadFile(formData);
        console.log(res?.data?.files.url, "cjeck");
        if (res?.data?.files.url) {
          uploadedMediaUrls.push({
            url: res?.data?.files.url,
            type: mediaFiles[0].type,
            name: mediaFiles[0].name,
          });
        }
      }
      // Create message object
      const newMsg = {
        content: newMessage.trim(),
        media: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : null,
        sender: username,
        isCurrentUser: true,
        senderId: LocalStorageGetItem("userData")?.id,
        timestamp: new Date().toISOString(),
      };

      // Add to local messages immediately for better UX
      setMessages((prevMessages) => [...prevMessages, newMsg]);

      // Emit to server
      socket.emit("send-message", newMsg);

      // Clear inputs
      setNewMessage("");
      setMediaFiles([]);

      // Stop typing when message is sent
      handleStopTyping();
    } catch (error) {
      console.error("Error sending message:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // const lastInputTimeRef = useRef<number>(0);

  // Typing indicator handlers
  const handleStartTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing-start");
    }
  };

  const handleStopTyping = () => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit("typing-stop");
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const now = Date.now();
    lastInputTimeRef.current = now;

    // Start typing if user is typing and not already indicated
    if (value.length > 0 && !isTypingRef.current) {
      handleStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 1 second of no input
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        // Only stop if no new input has been received
        if (Date.now() - lastInputTimeRef.current >= 1000) {
          handleStopTyping();
        }
      }, 1000);
    } else {
      // If input is empty, stop typing immediately
      handleStopTyping();
    }
  };

  // Format typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return "";

    // Filter out current user from typing users
    const otherTypingUsers = typingUsers.filter(
      (user) => user.userName !== username
    );

    if (otherTypingUsers.length === 0) return "";

    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing...`;
    } else if (otherTypingUsers.length === 3) {
      return `${otherTypingUsers[0].userName}, ${otherTypingUsers[1].userName}, and ${otherTypingUsers[2].userName} are typing...`;
    } else {
      return `${otherTypingUsers[0].userName}, ${
        otherTypingUsers[1].userName
      }, and ${otherTypingUsers.length - 2} others are typing...`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: MediaFile[] = [];

    for (const file of files) {
      const fileId = `file-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const fileUrl = URL.createObjectURL(file);

      newFiles.push({
        id: fileId,
        name: file.name,
        type: file.type,
        url: fileUrl,
        file: file, // Store the actual file object for upload
      });
    }

    setMediaFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Fetch initial data
  useEffect(() => {
    const fetchRoomUsers = async () => {
      const usersRes = await getRoomUsers(roomCode);
      const messageRes = await getRoomChat(roomCode);
      if (usersRes) {
        setRoomUsers(usersRes?.data?.data.users);
      }
      if (messageRes) {
        setChat(messageRes?.data?.data);
      }
    };

    fetchRoomUsers();
  }, [roomCode]);

  // Socket event listeners
  useEffect(() => {
    socket.on("receive-message", (message) => {
      setChat((prev) => [...prev, message]);
    });

    socket.on("typing-update", (data) => {
      setTypingUsers(data.typingUsers || []);
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing-update");
    };
  }, []);

  // Join room
  useEffect(() => {
    const userData = LocalStorageGetItem("userData");
    if (userData?.roomId && userData?.user_name) {
      socket.emit("join-room", userData?.roomId, userData?.user_name);
      console.log("Joined room");
    }
  }, []);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      handleStopTyping();
    };
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typingUsers]);

  if (!roomUsers || roomUsers.length === 0) {
    return <Loader />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header bar */}
      <header className="h-20 py-3 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onLeave}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-liveroom-purple text-white h-6 w-6 flex items-center justify-center rounded-full text-sm">
                L
              </span>
              LiveRoom
            </h1>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-muted-foreground">Room Name:</span>
            <span className="font-semibold text-white">
              {roomDetails?.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-muted-foreground">Room:</span>
            <span className="font-semibold text-white">{roomCode}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors duration-200"
            >
              {copied ? (
                <>
                  <FiCheck className="text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <FiClipboard />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="ml-2"
            >
              Leave Room
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle */}
        {isMobile && !showSidebar && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-20 right-2 z-10"
            onClick={toggleSidebar}
          >
            Users
          </Button>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {chat?.map((message, index: number) => (
                <MessageBubble key={index} message={message} />
              ))}
              {/* Enhanced typing indicator */}
              {typingUsers.length > 0 && getTypingText() && (
                <TypingIndicator isTyping={true} username={getTypingText()} />
              )}
              <div ref={messageEndRef} />
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="border-t border-border p-4 bg-card">
            {mediaFiles.length > 0 && (
              <MediaPreview files={mediaFiles} onRemove={removeFile} />
            )}

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length > 0}
              >
                <Image className="h-5 w-5" />
                <span className="sr-only">Attach media</span>
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,application/pdf"
              />

              <Textarea
                value={newMessage}
                onChange={handleMessageChange}
                onKeyDown={handleKeyPress}
                onFocus={() => {
                  // Start typing if there's content when focused
                  if (newMessage.trim() && !isTypingRef.current) {
                    handleStartTyping();
                  }
                }}
                onBlur={() => {
                  // Stop typing when input loses focus
                  handleStopTyping();
                }}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />

              <Button
                variant="default"
                size="icon"
                className="shrink-0 bg-liveroom-purple hover:bg-liveroom-purple-dark"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && mediaFiles.length === 0}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Users sidebar */}
        {(showSidebar || !isMobile) && (
          <aside
            className={`bg-sidebar border-l border-border w-64 p-4 flex flex-col ${
              isMobile
                ? "absolute right-0 top-16 bottom-0 z-50 animate-slide-in"
                : ""
            }`}
          >
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 self-end"
                onClick={toggleSidebar}
              >
                Close
              </Button>
            )}

            <div>
              <h3 className="font-semibold mb-3">People in this room</h3>
              <div className="space-y-3">
                {roomUsers?.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="border-2 border-background h-10 w-10 transition-transform hover:translate-y-[-5px]">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.user_name} />
                        ) : (
                          <AvatarFallback
                            className={getRandomColor(user.user_name)}
                          >
                            {getInitials(user.user_name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {user?.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-sidebar" />
                      )}
                      {/* Show typing indicator next to user */}
                      {typingUsers.some(
                        (typingUser) => typingUser.userName === user.user_name
                      ) && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {user.user_name}
                        {user.user_name === username && " (you)"}
                      </span>
                      {/* Show typing status */}
                      {typingUsers.some(
                        (typingUser) => typingUser.userName === user.user_name
                      ) && (
                        <span className="text-xs text-blue-400">typing...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="font-semibold mb-3">Online now</h3>
              <UserAvatarGroup
                users={roomUsers.filter((u) => u.isOnline)}
                maxUsers={5}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
