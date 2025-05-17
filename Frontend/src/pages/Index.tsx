
import React, { useState } from "react";
import JoinRoomForm from "@/components/JoinRoomForm";
import ChatRoom from "@/components/ChatRoom";

const Index: React.FC = () => {
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  const handleJoinRoom = (roomCode: string, username: string) => {
    setRoomCode(roomCode);
    setUsername(username);
    setJoinedRoom(true);
  };

  const handleLeaveRoom = () => {
    setJoinedRoom(false);
  };

  return (
    <div className="h-screen w-full">
      {joinedRoom ? (
        <ChatRoom
          roomCode={roomCode}
          username={username}
          onLeave={handleLeaveRoom}
        />
      ) : (
        <JoinRoomForm onJoin={handleJoinRoom} />
      )}
    </div>
  );
};

export default Index;
