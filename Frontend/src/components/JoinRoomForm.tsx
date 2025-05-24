import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "./ThemeToggle";
import { useApi } from "@/hooks/useApi";
import { LocalStorageGetItem, LocalStorageSetItem } from "@/utils/helpers";
import socket from "@/utils/socket";
import { useNavigate } from "react-router-dom";

interface JoinRoomFormProps {
  onJoin?: (roomCode: string, username: string) => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ onJoin }) => {
  const naviagte = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const { loading: isLoading, addToRoom } = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode.trim()) {
      toast({
        title: "Room Code Required",
        description: "Please enter a room code to join a room.",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to identify yourself.",
        variant: "destructive",
      });
      return;
    }

    const res = await addToRoom(roomCode, username);
    console.log(res)
    if(res?.data?.data) {
      onJoin(roomCode, username);
      LocalStorageSetItem("userData", res?.data?.data);
      // socket.emit("join-room", roomCode, username);
    } else {
      toast({
        title: "Error",
        description: res?.response?.data.message ?? "Failed to join the room. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        <Card className="glass-card overflow-hidden animate-scale-in border-liveroom-purple/20">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-liveroom-purple rounded-full p-3 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white"
                >
                  <path d="M12 3v4m0 14v-4m-9-5h4m14 0h-4M7.25 7.25l2.83 2.83m6.34 6.34 2.83 2.83M7.25 16.75l2.83-2.83m6.34-6.34 2.83-2.83" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Welcome to LiveRoom
            </CardTitle>
            <CardDescription>
              Enter a room code and your name to join the conversation
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-liveroom-purple focus:border-liveroom-purple"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-liveroom-purple focus:border-liveroom-purple"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-liveroom-purple hover:bg-liveroom-purple-dark transition-all duration-200"
                disabled={isLoading}
                // onClick={() => {
                //   if (isLoading) return;
                //   setIsLoading(true);
                // }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have a room code?{" "}
          <a href="/create-room" className="text-[#9061F9] hover:underline">
            Create your own room
          </a>{" "}
          to get started.
        </p>
      </div>
    </div>
  );
};

export default JoinRoomForm;
