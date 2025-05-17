
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface UserAvatarGroupProps {
  users: User[];
  maxUsers?: number;
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({ users, maxUsers = 5 }) => {
  const displayUsers = users.slice(0, maxUsers);
  const remainingCount = users.length - maxUsers;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      "bg-liveroom-purple text-white",
      "bg-liveroom-blue text-white",
      "bg-liveroom-green text-white",
      "bg-liveroom-red text-white",
    ];
    
    // Simple hash function to consistently assign same color to same user
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <TooltipProvider>
      <div className="flex -space-x-2 overflow-hidden animate-fade-in">
        {displayUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="border-2 border-background h-10 w-10 transition-transform hover:translate-y-[-5px]">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className={getRandomColor(user.name)}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="border-2 border-background h-10 w-10 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:translate-y-[-5px] transition-transform">
                <AvatarFallback>+{remainingCount}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more user{remainingCount !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default UserAvatarGroup;
