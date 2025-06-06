"use client";

import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MessageBubble({
  message,
  showAvatar,
  showTimestamp,
}: {
  message: any;
  showAvatar: boolean;
  showTimestamp: boolean;
}) {
  return (
    <div className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && !message.isOwn && (
        <Avatar>
          <AvatarImage src={message.avatar} alt={message.senderName} />
          <AvatarFallback>{message.senderName[0]}</AvatarFallback>
        </Avatar>
      )}
      {showAvatar && message.isOwn && <div className="w-10" />}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.isOwn ? "bg-blue-500 text-white" : "bg-muted"
        }`}
      >
        <p>{message.content}</p>
        {showTimestamp && (
          <p
            className={`text-xs mt-1 ${
              message.isOwn ? "text-blue-200" : "text-muted-foreground"
            }`}
          >
            {format(new Date(message.timestamp), "h:mm a")}
          </p>
        )}
      </div>
    </div>
  );
}