import apiClient from "../api/client";

export interface UserProfileSummary {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  isOnline?: boolean;
  country?: string;
  accountStatus?: string;
}

export interface AdminCSConversation {
  _id: string;
  userId: UserProfileSummary;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderRole: "user" | "admin";
  unreadAdminCount: number;
  unreadUserCount: number;
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface AdminCSMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: "user" | "admin";
  senderName?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminCSConversationDetail {
  conversation: AdminCSConversation;
  messages: AdminCSMessage[];
}

export const getAdminConversations = async (): Promise<AdminCSConversation[]> => {
  const res = await apiClient.get("/customer-service/admin/conversations");
  return res.data?.data || [];
};

export const getAdminConversationMessages = async (
  conversationId: string
): Promise<AdminCSConversationDetail> => {
  const res = await apiClient.get(
    `/customer-service/admin/conversations/${conversationId}/messages`
  );
  return res.data?.data;
};

export const sendAdminReply = async (
  conversationId: string,
  message: string
): Promise<AdminCSMessage> => {
  const res = await apiClient.post(
    `/customer-service/admin/conversations/${conversationId}/messages`,
    { message }
  );
  return res.data?.data;
};

export default {
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminReply,
};
