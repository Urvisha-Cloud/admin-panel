import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Headphones,
  Search,
  Send,
  RefreshCw,
  ShieldCheck,
  CheckCheck,
  MessageSquare,
  User,
  Copy,
  Check,
  X,
  Info,
  Globe,
  Users,
  MessageCircle,
} from "lucide-react";
import {
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminReply,
  AdminCSConversation,
  AdminCSMessage,
} from "../../services/customerService.service";
import {
  joinAdminConversation,
  leaveAdminConversation,
  markAdminCSMessagesRead,
  subscribeToAdminCSUpdates,
} from "../../services/adminSocket";

const formatAdminRelativeTime = (dateInput?: string | Date): string => {
  if (!dateInput) return "Just now";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Recently";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const formatDateDivider = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recent";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const CustomerServicePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "online">("all");
  const [replyText, setReplyText] = useState("");
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // 1. Fetch conversations list
  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
    isFetching: isConversationsFetching,
  } = useQuery({
    queryKey: ["admin-cs-conversations"],
    queryFn: getAdminConversations,
    refetchInterval: 15000,
  });

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  // 2. Fetch messages for active conversation
  const {
    data: activeConversationData,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["admin-cs-messages", selectedConversationId],
    queryFn: () =>
      selectedConversationId
        ? getAdminConversationMessages(selectedConversationId)
        : Promise.resolve(null),
    enabled: Boolean(selectedConversationId),
  });

  const activeMessages = activeConversationData?.messages || [];
  const activeConversation = activeConversationData?.conversation || null;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedConversationId, activeMessages.length]);

  // 3. Socket.IO Real-time Subscription
  useEffect(() => {
    if (selectedConversationId) {
      joinAdminConversation(selectedConversationId);
      markAdminCSMessagesRead(selectedConversationId);
    }

    const unsubscribe = subscribeToAdminCSUpdates(
      (newMsg: AdminCSMessage) => {
        if (newMsg && String(newMsg.conversationId) === String(activeConvIdRef.current)) {
          if (newMsg.senderRole === "user" && activeConvIdRef.current) {
            markAdminCSMessagesRead(activeConvIdRef.current);
          }
          queryClient.setQueryData(
            ["admin-cs-messages", activeConvIdRef.current],
            (old: any) => {
              if (!old) return old;
              const exists = old.messages.some((m: AdminCSMessage) => m._id === newMsg._id);
              if (exists) return old;
              return {
                ...old,
                messages: [...old.messages, newMsg],
              };
            }
          );
          setTimeout(() => scrollToBottom(true), 50);
        }
        queryClient.invalidateQueries({ queryKey: ["admin-cs-conversations"] });
      },
      (updatedConv: AdminCSConversation) => {
        queryClient.setQueryData(
          ["admin-cs-conversations"],
          (old: AdminCSConversation[] | undefined) => {
            if (!old) return [updatedConv];
            const filtered = old.filter((c) => c._id !== updatedConv._id);
            return [updatedConv, ...filtered];
          }
        );
      },
      (readData: { conversationId: string; readByRole: string }) => {
        if (
          readData?.conversationId === activeConvIdRef.current &&
          readData?.readByRole === "user"
        ) {
          // User read admin's messages -> change admin message double ticks to blue
          queryClient.setQueryData(
            ["admin-cs-messages", activeConvIdRef.current],
            (old: any) => {
              if (!old || !old.messages) return old;
              return {
                ...old,
                messages: old.messages.map((m: AdminCSMessage) =>
                  m.senderRole === "admin" ? { ...m, isRead: true } : m
                ),
              };
            }
          );
        }
      }
    );

    return () => {
      if (selectedConversationId) {
        leaveAdminConversation(selectedConversationId);
      }
      unsubscribe();
    };
  }, [selectedConversationId, queryClient]);

  // 4. Send Admin Reply Mutation
  const sendReplyMutation = useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => sendAdminReply(conversationId, message),
    onSuccess: (sentMessage) => {
      setReplyText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      queryClient.setQueryData(
        ["admin-cs-messages", selectedConversationId],
        (old: any) => {
          if (!old) return old;
          const exists = old.messages.some((m: AdminCSMessage) => m._id === sentMessage._id);
          if (exists) return old;
          return {
            ...old,
            messages: [...old.messages, sentMessage],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["admin-cs-conversations"] });
      setTimeout(() => scrollToBottom(true), 60);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send reply");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !selectedConversationId || sendReplyMutation.isPending) return;

    sendReplyMutation.mutate({
      conversationId: selectedConversationId,
      message: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Stats
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);
  }, [conversations]);

  const onlineUsersCount = useMemo(() => {
    return conversations.filter((c) => c.userId?.isOnline).length;
  }, [conversations]);

  // Filter and deduplicate conversations
  const filteredConversations = useMemo(() => {
    const seen = new Set<string>();
    let list = conversations.filter((c) => {
      if (!c?._id || seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });

    if (filterTab === "unread") {
      list = list.filter((c) => (c.unreadAdminCount || 0) > 0);
    } else if (filterTab === "online") {
      list = list.filter((c) => c.userId?.isOnline);
    }

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((c) => {
      const name = `${c.userId?.firstName || ""} ${c.userId?.lastName || ""}`.toLowerCase();
      const email = (c.userId?.email || "").toLowerCase();
      const lastMsg = (c.lastMessage || "").toLowerCase();
      return name.includes(query) || email.includes(query) || lastMsg.includes(query);
    });
  }, [conversations, searchQuery, filterTab]);

  // Deduplicate active messages
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return activeMessages.filter((m) => {
      const id = m._id || `${m.createdAt}_${m.message}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [activeMessages]);

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3.5">
      {/* ── Top Header & Stats Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-admin-lg border border-[rgba(244,114,182,0.18)] bg-[rgba(28,20,24,0.7)] px-5 py-3 shadow-admin backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-glow"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
            }}
          >
            <Headphones size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Customer Support Hub
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-emerald-400 border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Socket Live
              </span>
            </div>
            <p className="text-xs text-admin-muted">
              Real-time user inquiries, live messaging, and direct problem resolution
            </p>
          </div>
        </div>

        {/* Stats Chips & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(244,114,182,0.2)] bg-[rgba(26,18,23,0.7)] px-3 py-1.5 text-xs text-admin-muted">
              <Users size={13} className="text-admin-primary" />
              <span>Total:</span>
              <strong className="text-white">{conversations.length}</strong>
            </div>

            {totalUnreadCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/15 px-3 py-1.5 text-xs font-semibold text-pink-400">
                <MessageCircle size={13} />
                <span>{totalUnreadCount} Unread</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{onlineUsersCount} Online</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              refetchConversations();
              if (selectedConversationId) refetchMessages();
            }}
            disabled={isConversationsFetching}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] px-3 text-xs font-semibold text-admin-primary transition-all hover:bg-[rgba(244,114,182,0.22)] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={isConversationsFetching ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Main Chat Area (2-Column Grid + Optional Info Drawer) ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin">
        {/* ── Left Column: Conversations List ── */}
        <div className="flex w-[330px] shrink-0 flex-col border-r border-[rgba(244,114,182,0.18)] bg-[rgba(24,17,21,0.85)] backdrop-blur-md">
          {/* Search Box & Tabs */}
          <div className="border-b border-[rgba(244,114,182,0.14)] p-3 space-y-2.5">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
              />
              <input
                type="text"
                placeholder="Search by name, email, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[rgba(244,114,182,0.22)] bg-[rgba(18,12,16,0.95)] py-1.5 pl-8 pr-7 text-xs text-white placeholder-admin-muted transition-all focus:border-admin-primary focus:bg-[rgba(24,16,21,0.98)] focus:outline-none focus:ring-1 focus:ring-admin-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-muted hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-[rgba(0,0,0,0.3)] p-1">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`flex-1 rounded-md py-1 text-center text-[0.7rem] font-semibold transition-all ${
                  filterTab === "all"
                    ? "bg-admin-primary text-[#120E10] shadow-sm"
                    : "text-admin-muted hover:text-white"
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={`flex-1 rounded-md py-1 text-center text-[0.7rem] font-semibold transition-all ${
                  filterTab === "unread"
                    ? "bg-admin-primary text-[#120E10] shadow-sm"
                    : "text-admin-muted hover:text-white"
                }`}
              >
                Unread {totalUnreadCount > 0 && `(${totalUnreadCount})`}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("online")}
                className={`flex-1 rounded-md py-1 text-center text-[0.7rem] font-semibold transition-all ${
                  filterTab === "online"
                    ? "bg-admin-primary text-[#120E10] shadow-sm"
                    : "text-admin-muted hover:text-white"
                }`}
              >
                Online {onlineUsersCount > 0 && `(${onlineUsersCount})`}
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[rgba(255,255,255,0.03)]">
            {isConversationsLoading ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-admin-muted">
                <RefreshCw size={18} className="animate-spin text-admin-primary" />
                <span className="text-xs">Loading chats...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center p-6 text-center text-admin-muted">
                <MessageSquare size={28} className="mb-2 opacity-30 text-admin-primary" />
                <p className="text-xs font-semibold text-white">No chats found</p>
                <p className="mt-1 text-[0.7rem]">
                  {searchQuery
                    ? "No results match your search"
                    : filterTab === "unread"
                    ? "No unread user messages"
                    : filterTab === "online"
                    ? "No users currently online"
                    : "Active chats will appear here"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv._id === selectedConversationId;
                const user = conv.userId;
                const fullName =
                  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                  user?.email ||
                  "User";
                const initials =
                  fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "US";

                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversationId(conv._id)}
                    className={`group relative flex w-full items-start gap-3 p-3.5 text-left transition-all ${
                      isSelected
                        ? "bg-[rgba(244,114,182,0.15)] shadow-inner"
                        : "hover:bg-[rgba(244,114,182,0.06)]"
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-md bg-gradient-to-b from-[#F472B6] to-[#DB2777] shadow-[0_0_10px_#F472B6]" />
                    )}

                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={fullName}
                          className="h-10 w-10 rounded-full border border-[rgba(244,114,182,0.3)] object-cover shadow-sm"
                        />
                      ) : (
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#1F1018] shadow-sm"
                          style={{
                            background: "linear-gradient(135deg, #DDD6FE 0%, #F472B6 100%)",
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      {user?.isOnline ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#181115] bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                      ) : (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#181115] bg-zinc-600" />
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`truncate text-xs font-semibold ${
                            isSelected ? "text-white" : "text-[#E5E7EB]"
                          }`}
                        >
                          {fullName}
                        </span>
                        <span className="shrink-0 text-[0.66rem] text-admin-muted">
                          {formatAdminRelativeTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      <p
                        className={`mt-0.5 truncate text-[0.72rem] ${
                          conv.unreadAdminCount > 0
                            ? "font-medium text-pink-300"
                            : "text-admin-muted"
                        }`}
                      >
                        {conv.lastSenderRole === "admin" && (
                          <span className="text-admin-primary font-medium">You: </span>
                        )}
                        {conv.lastMessage || "Started conversation"}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadAdminCount > 0 && (
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-1.5 text-[0.65rem] font-bold text-white shadow-[0_0_12px_rgba(244,114,182,0.6)] animate-pulse">
                        {conv.unreadAdminCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Active Conversation Messages & Reply ── */}
        <div className="flex flex-1 flex-col bg-[rgba(16,11,14,0.92)]">
          {selectedConversationId ? (
            <>
              {/* Header: User Info & Actions */}
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-[rgba(244,114,182,0.18)] bg-[rgba(24,17,21,0.95)] px-6 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {activeConversation?.userId?.profileImage ? (
                      <img
                        src={activeConversation.userId.profileImage}
                        alt="User"
                        className="h-12 w-12 rounded-full border-2 border-[rgba(244,114,182,0.4)] object-cover shadow-md"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-[#1F1018] shadow-md ring-2 ring-[rgba(244,114,182,0.3)]"
                        style={{
                          background: "linear-gradient(135deg, #DDD6FE 0%, #F472B6 100%)",
                        }}
                      >
                        {activeConversation?.userId?.firstName?.[0] || "U"}
                      </div>
                    )}
                    {activeConversation?.userId?.isOnline ? (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#181115] bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                    ) : (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#181115] bg-zinc-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white tracking-wide">
                        {`${activeConversation?.userId?.firstName || ""} ${
                          activeConversation?.userId?.lastName || ""
                        }`.trim() ||
                          activeConversation?.userId?.email ||
                          "User"}
                      </h2>
                      {activeConversation?.userId?.accountStatus === "approved" && (
                        <span className="flex items-center gap-1 rounded-md bg-[rgba(244,114,182,0.15)] px-2 py-0.5 text-[0.68rem] font-semibold text-admin-primary border border-[rgba(244,114,182,0.25)]">
                          <ShieldCheck size={13} className="text-admin-primary" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-admin-muted">
                      <span>{activeConversation?.userId?.email || "No email provided"}</span>
                      <span>•</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          activeConversation?.userId?.isOnline
                            ? "text-emerald-400"
                            : "text-zinc-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            activeConversation?.userId?.isOnline ? "bg-emerald-400" : "bg-zinc-500"
                          }`}
                        />
                        {activeConversation?.userId?.isOnline ? "Active Now" : "Offline"}
                      </span>
                      {activeConversation?.userId?.country && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {activeConversation.userId.country}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Header Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => refetchMessages()}
                    disabled={isMessagesLoading}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-[rgba(244,114,182,0.2)] bg-[rgba(26,18,23,0.7)] px-3 text-xs font-semibold text-admin-muted hover:border-admin-primary hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    title="Refresh chat messages"
                  >
                    <RefreshCw
                      size={13}
                      className={isMessagesLoading ? "animate-spin text-admin-primary" : ""}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUserInfo((prev) => !prev)}
                    className={`flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-all active:scale-95 ${
                      showUserInfo
                        ? "border-admin-primary bg-[rgba(244,114,182,0.22)] text-admin-primary shadow-sm"
                        : "border-[rgba(244,114,182,0.2)] bg-[rgba(26,18,23,0.7)] text-admin-muted hover:border-admin-primary hover:text-white"
                    }`}
                    title="Toggle user details panel"
                  >
                    <Info size={14} />
                    <span>User Details</span>
                  </button>

                  <span className="flex h-9 items-center rounded-xl bg-gradient-to-r from-[rgba(244,114,182,0.18)] to-[rgba(219,39,119,0.15)] px-4 text-xs font-bold text-admin-primary border border-[rgba(244,114,182,0.3)] shadow-sm">
                    Live Support
                  </span>
                </div>
              </div>

              {/* Chat Message History Thread with Date Separators */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {isMessagesLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <RefreshCw size={22} className="animate-spin text-admin-primary" />
                  </div>
                ) : uniqueMessages.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center text-center text-admin-muted">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(244,114,182,0.1)] border border-[rgba(244,114,182,0.2)] text-admin-primary">
                      <MessageSquare size={26} />
                    </div>
                    <p className="text-sm font-bold text-white">Conversation Started</p>
                    <p className="mt-1 max-w-xs text-xs">
                      Send a message below or use quick response templates to assist this user.
                    </p>
                  </div>
                ) : (
                  uniqueMessages.map((msg, index) => {
                    const isAdmin = msg.senderRole === "admin";
                    const time = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    // Show date divider when date changes between messages
                    const prevMsg = uniqueMessages[index - 1];
                    const currentDate = new Date(msg.createdAt).toDateString();
                    const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                    const showDateDivider = currentDate !== prevDate;

                    return (
                      <React.Fragment key={msg._id || `msg_${index}`}>
                        {showDateDivider && (
                          <div className="my-3 flex items-center justify-center">
                            <span className="rounded-full border border-[rgba(244,114,182,0.18)] bg-[rgba(28,20,24,0.85)] px-3 py-0.5 text-[0.68rem] font-semibold text-admin-muted shadow-sm backdrop-blur-sm">
                              {formatDateDivider(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`group flex items-end gap-2.5 ${
                            isAdmin ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* User Avatar (Only on User messages) */}
                          {!isAdmin && (
                            <div className="shrink-0 mb-1">
                              {activeConversation?.userId?.profileImage ? (
                                <img
                                  src={activeConversation.userId.profileImage}
                                  alt="User"
                                  className="h-7 w-7 rounded-full border border-[rgba(244,114,182,0.3)] object-cover"
                                />
                              ) : (
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-bold text-[#1F1018]"
                                  style={{
                                    background: "linear-gradient(135deg, #DDD6FE 0%, #F472B6 100%)",
                                  }}
                                >
                                  {activeConversation?.userId?.firstName?.[0] || "U"}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Bubble Card */}
                          <div
                            className={`relative max-w-[68%] rounded-2xl px-4 py-2.5 text-xs shadow-md transition-all ${
                              isAdmin
                                ? "bg-gradient-to-br from-[#F472B6] to-[#DB2777] text-white rounded-br-xs shadow-[0_2px_12px_rgba(244,114,182,0.25)]"
                                : "bg-[rgba(32,23,28,0.92)] border border-[rgba(244,114,182,0.18)] text-[#FDF2F8] rounded-bl-xs"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between gap-3 text-[0.65rem] opacity-75">
                              <span className="font-semibold">
                                {isAdmin ? "Support Agent" : msg.senderName || "User"}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap leading-relaxed text-[0.84rem]">
                              {msg.message}
                            </p>

                            <div className="mt-1 flex items-center justify-end gap-1.5 text-[0.65rem] opacity-75">
                              <span>{time}</span>
                              {isAdmin && (
                                <CheckCheck
                                  size={13}
                                  strokeWidth={2.4}
                                  className={
                                    msg.isRead ? "text-[#1F1018] opacity-100" : "text-white/60"
                                  }
                                />
                              )}
                            </div>

                            {/* Hover Quick Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg._id, msg.message)}
                              className={`absolute -top-2.5 ${
                                isAdmin ? "-left-6" : "-right-6"
                              } opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-zinc-800/90 border border-zinc-700 p-1 text-zinc-300 hover:text-white shadow-sm`}
                              title="Copy text"
                            >
                              {copiedMsgId === msg._id ? (
                                <Check size={11} className="text-emerald-400" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sleek Compact Reply Bar */}
              <form
                onSubmit={handleSendReply}
                className="border-t border-[rgba(244,114,182,0.15)] bg-[rgba(24,17,21,0.98)] px-4 py-2.5 backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex flex-1 items-center rounded-xl border border-[rgba(244,114,182,0.24)] bg-[rgba(18,12,16,0.95)] px-3.5 py-1.5 shadow-inner transition-all focus-within:border-admin-primary focus-within:ring-1 focus-within:ring-admin-primary/40">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                      value={replyText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={sendReplyMutation.isPending}
                      className="max-h-24 min-h-[26px] w-full resize-none border-0 bg-transparent py-0.5 text-xs leading-relaxed text-white placeholder-admin-muted outline-none disabled:opacity-50"
                      style={{ height: "auto" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendReplyMutation.isPending}
                    className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                      boxShadow: replyText.trim()
                        ? "0 0 16px rgba(244, 114, 182, 0.45)"
                        : "none",
                    }}
                  >
                    {sendReplyMutation.isPending ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-admin-muted">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-glow"
                style={{
                  background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                  boxShadow: "0 0 28px rgba(244, 114, 182, 0.4)",
                }}
              >
                <Headphones size={32} strokeWidth={2.2} />
              </div>
              <h3 className="text-base font-bold text-white">Nexa Customer Support</h3>
              <p className="mt-1.5 max-w-sm text-xs text-admin-muted">
                Select any user conversation on the left to start live resolution and messaging.
              </p>
            </div>
          )}
        </div>

        {/* ── Optional Right Drawer: User Profile Info ── */}
        {showUserInfo && activeConversation && (
          <div className="w-[260px] shrink-0 border-l border-[rgba(244,114,182,0.18)] bg-[rgba(24,17,21,0.95)] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.14)] pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <User size={14} className="text-admin-primary" />
                User Information
              </h3>
              <button
                type="button"
                onClick={() => setShowUserInfo(false)}
                className="text-admin-muted hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              {activeConversation.userId?.profileImage ? (
                <img
                  src={activeConversation.userId.profileImage}
                  alt="User"
                  className="h-16 w-16 rounded-full border-2 border-[rgba(244,114,182,0.4)] object-cover shadow-glow"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-base font-bold text-[#1F1018] shadow-glow"
                  style={{
                    background: "linear-gradient(135deg, #DDD6FE 0%, #F472B6 100%)",
                  }}
                >
                  {activeConversation.userId?.firstName?.[0] || "U"}
                </div>
              )}
              <h4 className="mt-2 text-sm font-bold text-white">
                {`${activeConversation.userId?.firstName || ""} ${
                  activeConversation.userId?.lastName || ""
                }`.trim() || "User"}
              </h4>
              <p className="text-[0.72rem] text-admin-muted">
                {activeConversation.userId?.email || "No email available"}
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(244,114,182,0.18)] bg-[rgba(26,18,23,0.7)] p-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-admin-muted text-[0.7rem]">Status:</span>
                <span
                  className={`font-semibold text-[0.7rem] ${
                    activeConversation.userId?.isOnline ? "text-emerald-400" : "text-zinc-400"
                  }`}
                >
                  {activeConversation.userId?.isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-admin-muted text-[0.7rem]">Account:</span>
                <span className="font-semibold text-[0.7rem] text-admin-primary capitalize">
                  {activeConversation.userId?.accountStatus || "standard"}
                </span>
              </div>
              {activeConversation.userId?.country && (
                <div className="flex items-center justify-between">
                  <span className="text-admin-muted text-[0.7rem]">Country:</span>
                  <span className="font-semibold text-[0.7rem] text-white">
                    {activeConversation.userId.country}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-admin-muted text-[0.7rem]">Messages:</span>
                <span className="font-semibold text-[0.7rem] text-white">
                  {uniqueMessages.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerServicePage;
