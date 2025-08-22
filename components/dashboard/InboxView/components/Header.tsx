import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Star, MoreVertical, ShieldOff, ShieldBan, ChevronDown, Clock } from "lucide-react";
import { Conversation } from "../types";
import { getChannelIcon, getDefaultUserIcon, generateInitials, isValidAvatar } from "../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Digital Clock Component (horizontal pill)
function DigitalClock({ remainingSeconds, expired }: { remainingSeconds: number; expired: boolean }) {
  const label = React.useMemo(() => {
    const s = Math.max(0, remainingSeconds || 0);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (days > 0) return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

interface HeaderProps {
  selectedConversation: Conversation;
  isConnected: boolean;
  setLeftSidebarOpen: (v: boolean) => void;
  onToggleFavorite: () => void;
  onToggleDisable: () => void;
  onToggleBlock: () => void;
  onChangeStatus: (status: "open" | "pending" | "solved" | "closed") => void;
  remainingSeconds: number; // countdown provided by parent
  onAssign: (userId: string) => void;
  assignedTo?: string;
  users: { id: string; name: string; online: boolean }[];
}

export function Header({
  selectedConversation,
  isConnected,
  setLeftSidebarOpen,
  onToggleFavorite,
  onToggleDisable,
  onToggleBlock,
  onChangeStatus,
  remainingSeconds,
  onAssign,
  assignedTo,
  users
}: HeaderProps) {
  const expired = (remainingSeconds || 0) <= 0;

  const remainingLabel = React.useMemo(() => {
    const days = Math.floor((remainingSeconds || 0) / 86400);
    const hours = Math.floor(((remainingSeconds || 0) % 86400) / 3600);
    const minutes = Math.floor(((remainingSeconds || 0) % 3600) / 60);
    const seconds = (remainingSeconds || 0) % 60;
    if (days > 0) return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [remainingSeconds]);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b px-4 bg-white">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Avatar className="h-10 w-10">
            {isValidAvatar(selectedConversation.avatar) ? (
              <AvatarImage 
                src={selectedConversation.avatar} 
                alt={selectedConversation.name}
                onError={(e) => {
                  // Hide the image element to show fallback
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-bold">
              {generateInitials(selectedConversation.name)}
            </AvatarFallback>
          </Avatar>
          {selectedConversation.platform && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm scale-75">
              {getChannelIcon(selectedConversation.platform)}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-y-0">
          <h2 className="font-bold text-sm lg:text-base text-gray-900">{selectedConversation.name}</h2>
          {/* Assign conversation inline below username (minimal text dropdown) */}
          <div className="-mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs text-gray-500 hover:text-blue-600 inline-flex items-center gap-1">
                  {assignedTo ? `Assign Conversation • ${users.find(u => u.id === assignedTo)?.name || "User"}` : "Assign Conversation"}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map((u) => (
                  <DropdownMenuItem key={u.id} onClick={() => onAssign(u.id)}>
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${u.online ? "bg-green-500" : "bg-gray-400"}`} />
                    {u.name}
                    {assignedTo === u.id && <span className="ml-auto text-xs text-muted-foreground">(assigned)</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
       
        <DigitalClock remainingSeconds={remainingSeconds} expired={expired} />

        <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 gap-1 shadow-lg shadow-gray-200/50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleFavorite} 
            title="Mark as favorite"
            className="h-8 w-8 text-gray-600 hover:text-green-600 hover:bg-green-50"
          >
            <Star className={`h-4 w-4 ${selectedConversation.favorite ? "text-yellow-500 fill-yellow-500" : ""}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-green-600 hover:bg-green-50">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onToggleDisable}>
                <ShieldOff className="h-4 w-4 mr-2" /> {selectedConversation.isDisabled ? "Enable" : "Disable"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleBlock}>
                <ShieldBan className="h-4 w-4 mr-2" /> {selectedConversation.isBlocked ? "Unblock" : "Block"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
