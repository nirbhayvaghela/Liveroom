import { BACKEND_URL } from "@/utils/constants";
import axios from "axios";
import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);

  const addToRoom = async (room_id: string, name: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/update-room-user`, {
        room_id,
        name,
        mode: 1,
      });
      return res;
    } catch (err) {
      return err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromRoom = async (room_id: string, name: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/update-room-user`, {
        room_id,
        name,
        mode: 2,
      });
      return res;
    } catch (err) {
      return err;
    } finally {
      setLoading(false);
    }
  };

  const getRoomUsers = async (room_id: string) => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/list-group-members?room_id=${room_id}`
      );
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setLoading(false);
    }
  };

  const getRoomChat = async (room_id: string) => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/list-chat?room_id=${room_id}`
      );
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setLoading(false);
    }
  };
  const createRoom = async (name: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/create-room`, { name });
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (body: FormData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/upload`, body);
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    createRoom,
    addToRoom,
    removeFromRoom,
    getRoomUsers,
    getRoomChat,
    loading,
  };
}
