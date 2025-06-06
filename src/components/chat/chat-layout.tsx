"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { useChatStore } from "@/store/chat-store";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { TopBar } from "@/components/chat/top-bar";
import { LoadingSpinner } from "@/components/chat/loading-spinner";
import { User, Message } from "@/types";

export default function ChatLayout() {
  const { data: session } = useSession();
  const currentUser = session?.user as User; // Type assertion
  const {
    selectedUser,
    users,
    messages,
    sidebarOpen,
    setCurrentUser,
    setUsers,
    setMessages,
    setSelectedUser,
    toggleSidebar,
    initializePusher,
    cleanupPusher,
  } = useChatStore();

   // Initialize when session is loaded
  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser);
      initializePusher(currentUser.id);
    }

    return () => {
      cleanupPusher();
    };
  }, [currentUser, setCurrentUser, initializePusher, cleanupPusher]);

  // Fetch users with same interests
  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["chatUsers"],
    queryFn: () => api.get("/api/chat/users").then((res) => res.data),
    enabled: !!session?.user, // Only fetch if user is authenticated
  });

  // Set users when data is loaded
  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      // Select first user by default if none selected
      if (usersData.length > 0 && !selectedUser) {
        setSelectedUser(usersData[0]);
      }
    }
  }, [usersData, setUsers, selectedUser, setSelectedUser]);

  // Fetch messages when selected user changes
  const { isLoading: messagesLoading, data: messagesData } = useQuery({
    queryKey: ["messages", selectedUser?.id],
    queryFn: () =>
      api
        .get(`/api/chat/messages?userId=${selectedUser?.id}`)
        .then((res) => res.data as Message[]),
    enabled: !!selectedUser,
  });

  // Update messages in store when data is received
  useEffect(() => {
    if (messagesData && selectedUser && currentUser) {
      setMessages({
        ...messages,
        [selectedUser.id]: messagesData.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.senderId === currentUser.id,
        })),
      });
    }
  }, [messagesData, selectedUser, currentUser, messages, setMessages]);

  if (!currentUser || usersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "flex" : "hidden"} md:flex`}>
          <Sidebar />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <ChatWindow isLoading={messagesLoading} />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => toggleSidebar(false)}
        />
      )}
    </div>
  );
}