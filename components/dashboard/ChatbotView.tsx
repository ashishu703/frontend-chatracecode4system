"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Bot,
  MoreHorizontal,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDateToIST } from "@/utils/api/utility/date.utils";
import { PaginationInfo } from "@/types/api/common";
import {
  CHANNEL_OPTIONS,
  Chatbot,
  PAGE_SIZE_OPTIONS,
} from "@/types/chatbot/chatBotModel";
import { useFlows } from "@/hooks/useFlows";
import { ChatbotService } from "@/utils/api/chatbot/chatbot";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function ChatbotView() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [deletingChatbot, setDeletingChatbot] = useState<Chatbot | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    flow_id: "",
    for_all: false,
    chats: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [channel, setChannel] = useState("");

  // Use the existing useFlows hook
  const { flows, loading: flowsLoading } = useFlows();

  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const data = await ChatbotService.GET_CHATBOTS({
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: search,
        sort: sortBy,
        order: sortOrder,
      });

      if (data.success) {
        setChatbots(data.data || []);
        setPagination(
          data.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            pageSize: pagination.pageSize,
          }
        );
        console.log("Fetched chatbots:", data.data);
      } else {
        console.error("Failed to fetch chatbots:", data);
        setChatbots([]);
      }
    } catch (error: any) {
      console.error("Error fetching chatbots:", error);
      setChatbots([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbots();
  }, [pagination.currentPage, pagination.pageSize, search, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      flow_id: "",
      for_all: true,
      chats: [],
    });
    setChannel("");
    setAddModalOpen(true);
  };

  const openEditModal = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot);
    setFormData({
      title: chatbot.title,
      flow_id: chatbot.flow_id.toString(),
      for_all: chatbot.for_all,
      chats: chatbot.chatbotChats || [],
    });
    setEditModalOpen(true);
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setEditingChatbot(null);
    setDeletingChatbot(null);
    setFormData({
      title: "",
      flow_id: "",
      for_all: false,
      chats: [],
    });
  };

  const saveChatbot = async () => {
    if (!formData.title || !formData.flow_id) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        flow_id: parseInt(formData.flow_id),
        for_all: formData.for_all,
        chats: formData.chats,
        status: 1,
      };
      let response;
      if (editingChatbot) {
        response = await ChatbotService.UPDATE_CHATBOT({
          id: editingChatbot.id,
          ...payload,
        });
      } else {
        response = await ChatbotService.ADD_CHATBOT(payload);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingChatbot
            ? "Chatbot updated successfully"
            : "Chatbot created successfully",
          variant: "success",
        });
        closeModals();
        fetchChatbots();
      } else {
        console.error("Failed to save chatbot:", response);
        toast({
          title: "Error",
          description: response.msg || "Failed to save chatbot",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error saving chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to save chatbot",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteChatbot = async () => {
    if (!deletingChatbot) return;
    try {
      const response = await ChatbotService.DELETE_CHATBOT(deletingChatbot.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Chatbot deleted successfully",
          variant: "success",
        });
        closeModals();
        fetchChatbots();
      } else {
        console.error("Failed to delete chatbot:", response);
        toast({
          title: "Error",
          description: "Failed to delete chatbot",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  const toggleChatbotStatus = async (chatbot: Chatbot) => {
    try {
      setChatbots((prevChatbots) =>
        prevChatbots.map((cb) =>
          cb.id === chatbot.id ? { ...cb, active: !cb.active } : cb
        )
      );
      const response = await ChatbotService.CHANGE_BOT_STATUS({
        id: chatbot.id.toString(),
        status: chatbot.active ? 0 : 1,
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Chatbot status updated successfully",
          variant: "success",
        });
      } else {
        setChatbots((prevChatbots) =>
          prevChatbots.map((cb) =>
            cb.id === chatbot.id ? { ...cb, active: chatbot.active } : cb
          )
        );
        console.error("Failed to update chatbot status:", response.data);
        toast({
          title: "Error",
          description: "Failed to update chatbot status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setChatbots((prevChatbots) =>
        prevChatbots.map((cb) =>
          cb.id === chatbot.id ? { ...cb, active: chatbot.active } : cb
        )
      );
      console.error("Error updating chatbot status:", error);
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (chatbot: Chatbot) => {
    return (
      <Badge variant={chatbot.active ? "default" : "secondary"}>
        {chatbot.active ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen  transition-all duration-300">
      {/* Header */}
      <header className=" border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Chatbot
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Table Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Chatbot Management
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and monitor your chatbots
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search chatbots..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={sortBy} onValueChange={handleSort}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/80 border-b-2 border-slate-200">
                  <TableHead className="w-20 py-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center justify-center">ID</div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-200/60 transition-colors py-4 font-semibold text-slate-700 text-sm"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Title</span>
                      {sortBy === "title" && (
                        <span className="text-slate-500">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center">Flow</div>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center">Scope</div>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center">Status</div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-200/60 transition-colors py-4 font-semibold text-slate-700 text-sm"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Created</span>
                      {sortBy === "createdAt" && (
                        <span className="text-slate-500">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center justify-center">
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: pagination.pageSize }, (_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-10 rounded" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : chatbots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Bot className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-lg">
                            No chatbots found
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            {search
                              ? "Try adjusting your search criteria"
                              : "Create your first chatbot to get started"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  chatbots.map((chatbot, index) => (
                    <TableRow key={chatbot.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-700">
                              {String(
                                (pagination.currentPage - 1) *
                                  pagination.pageSize +
                                  index +
                                  1
                              ).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {chatbot.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Chatbot</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {chatbot.flow.title || "No Flow"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {chatbot.for_all ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              All Chats
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {chatbot.chatbotChats?.length || 0} Specific Chats
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!!chatbot.active}
                            onCheckedChange={() => toggleChatbotStatus(chatbot)}
                          />
                          {getStatusBadge(chatbot)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDateToIST(chatbot.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              <DropdownMenuItem
                                onClick={() => openEditModal(chatbot)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingChatbot(chatbot);
                                  setDeleteModalOpen(true);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Rows per page:</span>
                  <Select
                    value={String(pagination.pageSize)}
                    onValueChange={(val) => handlePageSizeChange(Number(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={String(opt)}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(
                          Math.max(1, pagination.currentPage - 1)
                        )
                      }
                      className={
                        pagination.currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pagination.currentPage === pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}
                  {pagination.totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          isActive={
                            pagination.currentPage === pagination.totalPages
                          }
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          className="cursor-pointer"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            pagination.totalPages,
                            pagination.currentPage + 1
                          )
                        )
                      }
                      className={
                        pagination.currentPage === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Chatbot Modal */}
      <Dialog open={addModalOpen || editModalOpen} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>{editingChatbot ? "Edit Chatbot" : "Add New Chatbot"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Select Channel *</Label>
              <Select
                value={channel}
                onValueChange={(value) => {
                  setChannel(value);
                  setFormData((prev) => ({ ...prev, for_all: true })); // Always for all chats when channel is selected
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                All incoming chats for the selected channel will be included.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Chatbot Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter chatbot title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow">Select Flow *</Label>
              <Select
                value={formData.flow_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, flow_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow" />
                </SelectTrigger>
                <SelectContent>
                  {flows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id.toString()}>
                      {flow.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                All flows in the system are shown
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.for_all}
                  disabled
                  onCheckedChange={() => {}}
                />
                <Label htmlFor="for_all">Turn on for all chats</Label>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, this chatbot will be triggered for all incoming
                chats of the selected channel
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={saveChatbot}
              disabled={
                saving || !formData.title || !formData.flow_id || !channel
              }
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {editingChatbot ? "Updating..." : "Creating..."}
                </>
              ) : editingChatbot ? (
                "Update Chatbot"
              ) : (
                "Create Chatbot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        open={deleteModalOpen}
        onOpenChange={closeModals}
        onConfirm={deleteChatbot}
        title="Delete Chatbot"
        description="Are you sure you want to delete this chatbot? This action cannot be undone."
        itemName={deletingChatbot?.title}
        itemDate={deletingChatbot?.createdAt}
        isLoading={saving}
      />
    </div>
  );
}
