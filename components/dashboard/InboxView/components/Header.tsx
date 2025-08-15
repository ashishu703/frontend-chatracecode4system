import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Star, MoreVertical, Clock, UserCircle2, ShieldOff, ShieldBan } from "lucide-react";
import { Conversation } from "../types";
import { getChannelIcon } from "../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Digital Clock Component (shows remaining window time)
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
    <div className="relative">
      <div className={`w-16 h-16 rounded-full border-4 ${expired ? "border-red-300" : "border-green-200"} shadow-lg ${expired ? "shadow-red-200/50" : "shadow-green-200/50"} flex items-center justify-center relative`}>
        <div className={`absolute inset-1 rounded-full border-2 ${expired ? "border-red-600" : "border-green-600"}`}></div>
        <div className="flex flex-col items-center justify-center text-center z-10">
          {label.includes('d') ? (
            <>
              <span className={`text-xs font-bold ${expired ? "text-red-700" : "text-gray-600"}`}>
                {label.split(' ')[0]}
              </span>
              <span className={`text-xs font-bold ${expired ? "text-red-700" : "text-gray-600"}`}>
                {label.split(' ')[1]}
              </span>
            </>
          ) : (
            <span className={`text-xs font-bold ${expired ? "text-red-700" : "text-gray-600"}`}>
              {label}
            </span>
          )}
        </div>
      </div>
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
        
        {/* Digital Clock now shows remaining time */}
        <DigitalClock remainingSeconds={remainingSeconds} expired={expired} />
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
            <AvatarFallback>{selectedConversation.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">{getChannelIcon(selectedConversation.platform)}</div>
        </div>
        
        <div className="flex flex-col">
          <h2 className="font-bold text-sm lg:text-base text-gray-500">{selectedConversation.name}</h2>
          {/* Removed the green remaining label under the username */}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Assign Conversation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 bg-gray-100 border-gray-300 text-gray-700 font-bold hover:bg-gray-200 shadow-lg shadow-gray-200/50">
              Assign User
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
        
        {/* Star and Vertical Dots in Gray Box */}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-gray-100 border-gray-300 text-gray-700 font-bold hover:bg-gray-200 shadow-lg shadow-gray-200/50">
              Submit As
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onChangeStatus("open")}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus("solved")}>Solved</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus("closed")}>Closed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
