import express from "express";
import cors from "cors";
import { generateRoomId } from "./utils/helpers.js";
import prisma from "./lib/db.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or specify your frontend origin
    methods: ["GET", "POST"],
  },
});

// Store typing users per room
const typingUsers = new Map(); // roomId -> Set of {userId, userName, socketId}
const typingTimeouts = new Map(); // socketId -> timeoutId

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("join-room", async (roomId, userName) => {
    console.log(`User ${userName} is trying to join room ${roomId}`);

    try {
      const socketsInRoom = await io.in(roomId).fetchSockets();
      if (socketsInRoom.length >= 10) {
        socket.emit("room-full", "Room is full");
        return;
      }
      socket.join(roomId);

      const room_user = await prisma.user.update({
        where: { user_name: userName },
        data: { isOnline: true },
      });

      socket.data.roomId = roomId;
      socket.data.user = room_user;

      console.log(`${room_user.user_name} joined room ${roomId}`);
    } catch (err) {
      console.error("Error during join-room:", err);
    }
  });

  socket.on("send-message", async (message) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const sender = await prisma.user.findUnique({
        where: { id: message.senderId },
      });
      if (!sender) {
        throw new Error("Sender not found");
      }

      const newMessage = await prisma.message.create({
        data: {
          content: message.content,
          roomId,
          senderId: sender.id,
        },
        include: {
          sender: true,
        },
      });

      // Remove user from typing when they send a message
      removeUserFromTyping(socket, roomId);

      io.to(roomId).emit("receive-message", newMessage);
    } else {
      console.log("User not in a room, message not sent");
    }
  });

  // Typing indicator events
  socket.on("typing-start", () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;

    if (roomId && user) {
      addUserToTyping(socket, roomId, user);
    }
  });

  socket.on("typing-stop", () => {
    const roomId = socket.data.roomId;

    if (roomId) {
      removeUserFromTyping(socket, roomId);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected");

    const roomId = socket.data.roomId;
    const user = socket.data.user;

    if (user) {
      await prisma.user.update({
        where: { user_name: user.user_name },
        data: { isOnline: false },
      });
    }

    // Remove from typing indicators
    if (roomId) {
      removeUserFromTyping(socket, roomId);
    }

    // Clear any existing timeout
    clearTypingTimeout(socket.id);
  });
});

// Helper functions for typing indicators
function addUserToTyping(socket, roomId, user) {
  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Set());
  }

  const roomTypingUsers = typingUsers.get(roomId);
  const userInfo = {
    userId: user.id,
    userName: user.user_name,
    socketId: socket.id,
  };

  // Remove existing entry for this user (if any)
  for (const existingUser of roomTypingUsers) {
    if (existingUser.userId === user.id) {
      roomTypingUsers.delete(existingUser);
      break;
    }
  }

  // Add user to typing
  roomTypingUsers.add(userInfo);

  // Clear existing timeout for this socket
  clearTypingTimeout(socket.id);

  // Broadcast typing update to room (excluding the typing user)
  broadcastTypingUpdate(roomId, socket.id);
}

function removeUserFromTyping(socket, roomId) {
  if (!typingUsers.has(roomId)) return;

  const roomTypingUsers = typingUsers.get(roomId);
  const user = socket.data.user;

  if (user) {
    // Remove user from typing
    for (const typingUser of roomTypingUsers) {
      if (typingUser.userId === user.id) {
        roomTypingUsers.delete(typingUser);
        break;
      }
    }

    // Clean up empty rooms
    if (roomTypingUsers.size === 0) {
      typingUsers.delete(roomId);
    }
  }

  // Clear timeout
  clearTypingTimeout(socket.id);

  // Broadcast typing update to room (excluding the user who stopped typing)
  broadcastTypingUpdate(roomId, socket.id);
}

function clearTypingTimeout(socketId) {
  if (typingTimeouts.has(socketId)) {
    clearTimeout(typingTimeouts.get(socketId));
    typingTimeouts.delete(socketId);
  }
}

function broadcastTypingUpdate(roomId, excludeSocketId) {
  if (!typingUsers.has(roomId)) {
    // No one is typing
    io.to(roomId).emit("typing-update", { typingUsers: [] });
    return;
  }

  const roomTypingUsers = typingUsers.get(roomId);
  const typingUsersList = Array.from(roomTypingUsers).map((user) => ({
    userId: user.userId,
    userName: user.userName,
  }));

  // Broadcast to all users in the room
  io.to(roomId).emit("typing-update", { typingUsers: typingUsersList });
}

// Existing API routes...
app.post("/create-room", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const isRoomNameExits = prisma.room.findUnique({
    where: {
      name,
    },
  });

  if (!isRoomNameExits) {
    return res
      .status(400)
      .json({ error: "Please chhose another room name,It is already exits." });
  }

  const newUser = await prisma.room.create({
    data: {
      name,
      room_id: generateRoomId(),
    },
  });

  return res.json({
    message: "Room created Successfully.",
    data: { ...newUser },
  });
});

app.post("/update-room-user", async (req, res) => {
  const { name, room_id, mode } = req.body;

  if (!name || !room_id || ![1, 2].includes(mode)) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  const room = await prisma.room.findUnique({
    where: { room_id },
    include: { users: true },
  });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (mode === 1) {
    // ADD user to room
    if (room.users.length >= 10) {
      return res.status(400).json({ message: "Room is full (max 10 users)" });
    }

    let user = await prisma.user.findUnique({
      where: { user_name: name },
    });

    if (user) {
      user = await prisma.user.update({
        where: { user_name: name },
        data: { roomId: room.room_id },
      });
    } else {
      user = await prisma.user.create({
        data: {
          user_name: name,
          roomId: room.room_id,
        },
      });
    }

    return res.json({
      message: "User added to room",
      data: { ...user, roomId: room_id },
    });
  }

  if (mode === 2) {
    // REMOVE user from room
    const user = await prisma.user.findUnique({
      where: { user_name: name },
    });

    if (!user || user.roomId !== room.room_id) {
      return res.status(404).json({ error: "User not found in this room" });
    }

    await prisma.user.update({
      where: { user_name: name },
      data: {
        roomId: null,
      },
    });

    return res.json({ message: "User removed from room" });
  }
});

app.get("/list-group-members", async (req, res) => {
  const { room_id } = req.query;

  if (!room_id) {
    return res.status(400).json({ error: "room_id is required" });
  }

  const room = await prisma.room.findUnique({
    where: { room_id: room_id.toString() },
    include: {
      users: {
        select: {
          id: true,
          user_name: true,
          image: true,
          updatedAt: true,
          isOnline: true,
        },
      },
    },
  });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    message: "Room members retrieved successfully",
    data: {
      room_id: room.room_id,
      name: room.name,
      users: room.users,
    },
  });
});

app.get("/list-chat", async (req, res) => {
  const { room_id } = req.query;

  if (!room_id) {
    return res.status(400).json({ error: "room_id is required" });
  }

  const messages = await prisma.message.findMany({
    where: { roomId: room_id.toString() },
    include: {
      sender: true,
    },
  });

  if (!messages) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    message: "Room messages retrieved successfully",
    data: messages,
  });
});

server.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
