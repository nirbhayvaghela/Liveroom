
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Image, Send, ArrowLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import UserAvatarGroup from "./UserAvatarGroup";
import MediaPreview, { MediaFile } from "./MediaPreview";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock data for demo purposes
const mockUsers = [
  { id: "1", name: "Alex Morgan", isOnline: true },
  { id: "2", name: "Taylor Swift", isOnline: true, avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300&h=300&fit=crop&q=80" },
  { id: "3", name: "Chris Evans", isOnline: false },
  { id: "4", name: "Jordan Peterson", isOnline: true },
  { id: "5", name: "Emma Watson", isOnline: true },
  { id: "6", name: "John Smith", isOnline: false },
  { id: "7", name: "Olivia Parker", isOnline: true },
];

const mockMessages = [
  {
    id: "m1",
    content: "Hello everyone! Welcome to our new LiveRoom chat 👋",
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 25 * 60000),
    isCurrentUser: false,
  },
  {
    id: "m2",
    content: "Thanks for setting this up! The UI looks great.",
    sender: mockUsers[1],
    timestamp: new Date(Date.now() - 20 * 60000),
    isCurrentUser: false,
  },
  {
    id: "m3",
    content: "I just joined this room. What is everyone talking about?",
    sender: mockUsers[3],
    timestamp: new Date(Date.now() - 15 * 60000),
    isCurrentUser: true,
    media: [
      {
        id: "f1",
        name: "screenshot.png",
        type: "image/png",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=350&fit=crop",
      },
    ],
  },
  {
    id: "m4",
    content: "We're discussing the new LiveRoom features. Take a look at this presentation:",
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 10 * 60000),
    isCurrentUser: false,
    media: [
      {
        id: "f2",
        name: "presentation.pdf",
        type: "application/pdf",
        url: "#",
      },
    ],
  },
  {
    id: "m5",
    content: "This is really impressive! The animations are so smooth.",
    sender: mockUsers[2],
    timestamp: new Date(Date.now() - 5 * 60000),
    isCurrentUser: false,
  },
];

interface ChatRoomProps {
  roomCode: string;
  username: string;
  onLeave: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomCode, username, onLeave }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicators
  useEffect(() => {
    const randomInterval = Math.floor(Math.random() * 20000) + 10000; // 10-30 seconds
    const typingInterval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1)) + 1];
      setIsTyping(true);
      setTypingUser(randomUser.name);
      
      // Stop typing after 3-5 seconds
      setTimeout(() => {
        setIsTyping(false);
        setTypingUser("");
      }, Math.random() * 2000 + 3000);
    }, randomInterval);
    
    return () => clearInterval(typingInterval);
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() && mediaFiles.length === 0) return;
    
    const newMsg = {
      id: `m${Date.now()}`,
      content: newMessage.trim(),
      sender: { id: "current-user", name: username, isOnline: true },
      timestamp: new Date(),
      isCurrentUser: true,
      media: mediaFiles.length > 0 ? [...mediaFiles] : undefined,
    };
    
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage("");
    setMediaFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaFile[] = [];
    
    Array.from(files).forEach((file) => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileUrl = URL.createObjectURL(file);
      
      newFiles.push({
        id: fileId,
        name: file.name,
        type: file.type,
        url: fileUrl,
      });
    });
    
    setMediaFiles((prev) => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id));
  };

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header bar */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card">
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
            <p className="text-xs text-muted-foreground">Room: {roomCode}</p>
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
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <TypingIndicator isTyping={isTyping} username={typingUser} />
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
              >
                <Image className="h-5 w-5" />
                <span className="sr-only">Attach media</span>
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept="image/*,video/*,application/pdf"
              />
              
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
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
              isMobile ? "absolute right-0 top-16 bottom-0 z-50 animate-slide-in" : ""
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
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-liveroom-purple text-white flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        )}
                      </div>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-sidebar" />
                      )}
                    </div>
                    <span className="text-sm">
                      {user.name}
                      {user.name === username && " (you)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-semibold mb-3">Online now</h3>
              <UserAvatarGroup users={mockUsers.filter(u => u.isOnline)} maxUsers={5} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
