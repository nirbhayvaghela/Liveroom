import React, { useState } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { createRoom } = useApi();
  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setIsCreating(true);

    const res = await createRoom(roomName.trim());
    if (!res?.data?.data) {
      toast({
        title: "Error",
        description:
          res?.response?.data?.message ??
          "An Error occured, Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }
    setGeneratedRoom({
      name: res.data.data.name,
      code: res.data.data.room_id,
    });
    setIsCreating(false);
  };

  const copyRoomCode = async () => {
    if (generatedRoom) {
      try {
        await navigator.clipboard.writeText(generatedRoom.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = generatedRoom.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleBackToJoin = () => {
    navigate("/");
    setGeneratedRoom(null);
    setRoomName("");
  };

  const handleCreateAnother = () => {
    setGeneratedRoom(null);
    setRoomName("");
  };

  if (generatedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Room Created!</h1>
          <p className="text-white/70 mb-8 text-lg">
            Your room is ready for participants
          </p>

          <div className="space-y-6">
            <div className="text-left">
              <label className="block text-white font-medium mb-2">
                Room Name
              </label>
              <div className="bg-white/10 border-2 border-white/20 rounded-xl p-4 text-white">
                {generatedRoom.name}
              </div>
            </div>

            <div className="text-left">
              <label className="block text-white font-medium mb-2">
                Room Code
              </label>
              <div className="bg-white/10 border-2 border-purple-500/50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-white font-mono text-lg tracking-wider">
                  {generatedRoom.code}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="ml-3 p-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2 animate-pulse">
                  Room code copied to clipboard!
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleCreateAnother}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Create Another Room
            </button>

            <button
              onClick={handleBackToJoin}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              Back to Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-white text-2xl">✨</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Create New Room</h1>
        <p className="text-white/70 mb-8 text-lg">
          Start a new conversation room
        </p>

        <div className="space-y-6">
          <div className="text-left">
            <label
              htmlFor="roomName"
              className="block text-white font-medium mb-2"
            >
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all duration-200 text-lg"
              maxLength={50}
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!roomName.trim() || isCreating}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Room...
              </div>
            ) : (
              "Create Room"
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/60 text-sm mb-4">
            Already have a room code?
          </p>
          <button
            onClick={handleBackToJoin}
            className="flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors duration-200 mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Join existing room
          </button>
        </div>
      </div>
    </div>
  );
}
