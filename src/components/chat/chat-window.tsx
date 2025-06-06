"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageInput } from "@/components/chat/message-input";
import { useChatStore } from "@/store/chat-store";
import { LoadingSpinner } from "@/components/chat/loading-spinner";

export function ChatWindow({ isLoading }: { isLoading: boolean }) {
  const { selectedUser, messages, typingUsers, currentUser } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Select a mentee to start chatting
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentMessages = selectedUser ? messages[selectedUser.id] || [] : [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
              <p className="text-muted-foreground text-sm">
                Start a conversation with {selectedUser.name.split(" ")[0]}
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentMessages.map((message, index) => {
              const showAvatar =
                index === 0 || currentMessages[index - 1].senderId !== message.senderId;
              const showTimestamp =
                index === currentMessages.length - 1 ||
                currentMessages[index + 1].senderId !== message.senderId ||
                currentMessages[index + 1].timestamp.getTime() -
                  message.timestamp.getTime() >
                  300000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                />
              );
            })}

            {/* Typing Indicator */}
            {typingUsers[selectedUser.id] && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedUser.name.split(" ")[0]} is typing...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {selectedUser && <MessageInput />}
    </div>
  );
}