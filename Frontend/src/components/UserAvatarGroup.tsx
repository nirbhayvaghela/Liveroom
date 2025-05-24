/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials, getRandomColor } from "@/utils/helpers";

interface UserAvatarGroupProps {
  users: any[];
  maxUsers?: number;
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({
  users,
  maxUsers = 5,
}) => {
  const displayUsers = users.slice(0, maxUsers);
  const remainingCount = users.length - maxUsers;




  return (
    <TooltipProvider>
      <div className="flex -space-x-2 overflow-hidden animate-fade-in">
        {displayUsers?.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="border-2 border-background h-10 w-10 transition-transform hover:translate-y-[-5px]">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.user_name} />
                  ) : (
                    <AvatarFallback className={getRandomColor(user.user_name)}>
                      {getInitials(user.user_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.user_name}</p>
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
              <p>
                {remainingCount} more user{remainingCount !== 1 ? "s" : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default UserAvatarGroup;
