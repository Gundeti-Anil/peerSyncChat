"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserItem } from "@/components/chat/user-item";
import { useChatStore } from "@/store/chat-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

export function Sidebar() {
  const { users, selectedUser, setSelectedUser, toggleSidebar } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    if (debouncedSearch) {
      setFilteredUsers(
        users.filter((user) =>
          user.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [debouncedSearch, users]);

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    toggleSidebar(false);
  };

  return (
    <div className="w-full md:w-80 bg-background border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentees..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No mentees found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onClick={() => handleUserSelect(user)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}