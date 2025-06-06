"use client";

import { Menu, Video, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chat-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { selectedUser, toggleSidebar } = useChatStore();

  if (!selectedUser) {
    return (
      <div className="h-16 border-b flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const initials = selectedUser.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{selectedUser.name}</p>
          <p className="text-xs text-muted-foreground">
            {selectedUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}