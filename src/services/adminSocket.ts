import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getAdminSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
  return envUrl.replace(/\/api\/?$/, "");
};

export const getAdminSocket = (): Socket => {
  if (!socket) {
    const url = getAdminSocketUrl();
    socket = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      // Auto-join the admin customer service room on connect/reconnect
      socket?.emit("join_cs_admin");
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const joinAdminConversation = (conversationId: string) => {
  const s = getAdminSocket();
  s.emit("join_cs_chat", { conversationId });
};

export const leaveAdminConversation = (conversationId: string) => {
  if (socket && socket.connected) {
    socket.emit("leave_cs_chat", { conversationId });
  }
};

export const markAdminCSMessagesRead = (conversationId: string, userId?: string) => {
  const s = getAdminSocket();
  const payload = { conversationId, role: "admin", userId };
  if (s.connected) {
    s.emit("mark_cs_messages_read", payload);
  } else {
    s.once("connect", () => {
      s.emit("mark_cs_messages_read", payload);
    });
  }
};

export const subscribeToAdminCSUpdates = (
  onNewMessage?: (msg: any) => void,
  onConversationUpdated?: (conv: any) => void,
  onMessagesRead?: (data: { conversationId: string; readByRole: string }) => void
) => {
  const s = getAdminSocket();

  if (onNewMessage) {
    s.on("new_cs_message", onNewMessage);
  }
  if (onConversationUpdated) {
    s.on("cs_conversation_updated", onConversationUpdated);
  }
  if (onMessagesRead) {
    s.on("cs_messages_read", onMessagesRead);
  }

  return () => {
    if (onNewMessage) s.off("new_cs_message", onNewMessage);
    if (onConversationUpdated) s.off("cs_conversation_updated", onConversationUpdated);
    if (onMessagesRead) s.off("cs_messages_read", onMessagesRead);
  };
};

export default {
  getAdminSocket,
  joinAdminConversation,
  leaveAdminConversation,
  markAdminCSMessagesRead,
  subscribeToAdminCSUpdates,
};
