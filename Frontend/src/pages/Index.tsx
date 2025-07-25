import React, { useEffect, useState } from "react";
import JoinRoomForm from "@/components/JoinRoomForm";
import ChatRoom from "@/components/ChatRoom";
import { BACKEND_URL } from "@/utils/constants";
import socket from "@/utils/socket";
import { useApi } from "@/hooks/useApi";
import { SessionStorageGetItem } from "@/utils/helpers";

const Index: React.FC = () => {
  // const [joinedRoom, setJoinedRoom] = useState(false);
  const userData = SessionStorageGetItem("userData");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  const { removeFromRoom } = useApi();
  const handleJoinRoom = (roomCode: string, username: string) => {
    setRoomCode(roomCode);
    setUsername(username);
    // setJoinedRoom(true);
  };

  const handleLeaveRoom = () => {
    // setJoinedRoom(false);
    sessionStorage.removeItem("userData");
    removeFromRoom(userData?.roomId, userData?.user_name);
    // window.location.reload();
  };

  
  return (
    <div className="h-screen w-full">
      {userData ? (
        <ChatRoom
          roomCode={userData?.roomId}
          username={userData?.user_name}
          onLeave={handleLeaveRoom}
        />
      ) : (
        <JoinRoomForm onJoin={handleJoinRoom} />
      )}
    </div>
  );
};

export default Index;
