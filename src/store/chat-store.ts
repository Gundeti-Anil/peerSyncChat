import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import Pusher, {PresenceMember} from "pusher-js";
import type { User, Message } from "@/types";

interface ChatState {
  currentUser: User | null;
  selectedUser: User | null;
  users: User[];
  messages: Record<string, Message[]>;
  sidebarOpen: boolean;
  pusherClient: Pusher | null;
  typingUsers: Record<string, boolean>;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setSelectedUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setMessages: (messages: Record<string, Message[]>) => void;
  addMessage: (userId: string, message: Message) => void;
  toggleSidebar: (open?: boolean) => void;
  setTypingStatus: (userId: string, isTyping: boolean) => void;
  
  // Pusher methods
  initializePusher: (userId: string) => void;
  cleanupPusher: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    currentUser: null,
    selectedUser: null,
    users: [],
    messages: {},
    sidebarOpen: false,
    pusherClient: null,
    typingUsers: {},

    setCurrentUser: (user) => set({ currentUser: user }),
    setSelectedUser: (user) => set({ selectedUser: user }),
    setUsers: (users) => set({ users }),
    setMessages: (messages) => set({ messages }),
    addMessage: (userId, message) =>
      set((state) => {
        if (!state.messages[userId]) {
          state.messages[userId] = [];
        }
        state.messages[userId].push(message);
      }),
    toggleSidebar: (open) =>
      set((state) => ({
        sidebarOpen: open !== undefined ? open : !state.sidebarOpen,
      })),
    setTypingStatus: (userId, isTyping) =>
      set((state) => {
        state.typingUsers[userId] = isTyping;
      }),

    initializePusher: (userId) => {
      if (get().pusherClient) return;

      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
        enabledTransports: ["ws", "wss"],
      });

       // Private channel for messages
  const privateChannel = pusher.subscribe(`private-user-${userId}`);
  
  // Presence channel for online status
  const presenceChannel = pusher.subscribe(`presence-chat`);

  presenceChannel.bind('pusher:subscription_succeeded', () => {
    const members = presenceChannel.members;
    // Update online status for all users
    set(state => {
      state.users = state.users.map(user => ({
        ...user,
        isOnline: members.has(user.id)
      }));
    });
  });

  presenceChannel.bind('pusher:member_added', (member: PresenceMember) => {
    // User came online
    set(state => {
      const user = state.users.find(u => u.id === member.id);
      if (user) user.isOnline = true;
      return state;
    });
  });

  presenceChannel.bind('pusher:member_removed', (member: PresenceMember) => {
    // User went offline
    set(state => {
      const user = state.users.find(u => u.id === member.id);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date().toISOString();
      }
      return state;
    });
  });

      // Subscribe to user's private channel
      const channel = pusher.subscribe(`private-user-${userId}`);

      channel.bind("message", (data: Message) => {
        get().addMessage(data.senderId, data);
      });

      channel.bind("typing", (data: { userId: string; isTyping: boolean }) => {
        get().setTypingStatus(data.userId, data.isTyping);
      });

      set({ pusherClient: pusher });
    },

    cleanupPusher: () => {
      get().pusherClient?.disconnect();
      set({ pusherClient: null });
    },
  }))
);