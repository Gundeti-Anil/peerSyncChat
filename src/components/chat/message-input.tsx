"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState, KeyboardEvent } from "react";
import { useChatStore } from "@/store/chat-store";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function MessageInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedUser, currentUser, addMessage } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return;

    setIsSending(true);
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: message,
      timestamp: new Date(),
      isOwn: true,
    };

    // Optimistically add message
    addMessage(selectedUser.id, newMessage);

   try {
  await api.post("/chat/messages", {
    recipientId: selectedUser.id,
    content: message,
  });
} catch (error) {
  // Replace with actual toast implementation
  toast({
    title: "Failed to send message",
    description: "Please try again",
    variant: "destructive",
  });
  
}

    setMessage("");
    setIsSending(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none pr-10"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}