"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserItemProps {
  user: any;
  isSelected: boolean;
  onClick: () => void;
}

export function UserItem({ user, isSelected, onClick }: UserItemProps) {
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-muted"
          : "hover:bg-muted/50"
      )}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{user.name}</p>
          {user.lastSeen && (
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {user.lastSeen}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {user.interestedIn.join(", ")}
        </p>
      </div>
    </div>
  );
}