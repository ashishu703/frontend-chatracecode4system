"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { setCurrentView } from "@/store/slices/dashboardSlice";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { Flow, PAGE_SIZE_OPTIONS } from "@/types/chatbot/chatBotModel";
import { PaginationInfo } from "@/types/api/common";
import { useFlows } from "@/hooks/useFlows";
import { formatDateToIST } from "@/utils/api/utility/date.utils";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { UtilityMethod } from "@/utils/api/utility/utility-method";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AllFlowsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFlow, setDeletingFlow] = useState<Flow | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    flows,
    loading,
    error,
    pagination,
    refetch,
    deleteFlow: deleteFlowFromHook,
  } = useFlows();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    refetch({ sort: field, order: sortOrder, page: 1 });
  };

  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      const timeoutId = setTimeout(() => {
        refetch({ search: searchTerm, page: 1 });
      }, 1000);

      return () => clearTimeout(timeoutId);
    },
    [refetch]
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const confirmDeleteFlow = async () => {
    if (!deletingFlow) return;

    const result = await deleteFlowFromHook(
      deletingFlow.id,
      deletingFlow.flow_id
    );
    if (result.success) {
      toast({
        title: "Success",
        description: "Flow deleted successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete flow",
        variant: "destructive",
      });
    }
    setDeleteModalOpen(false);
    setDeletingFlow(null);
  };

  return (
    <div className="min-h-screen transition-all duration-300">
      {/* Header */}
      <header className=" border-b border-slate-200/60 px-6 py-2">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => dispatch(setCurrentView("flows"))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Flow
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Flow Management
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and monitor your chat flows
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search flows..."
                    value={search}
                    onChange={handleSearchChange}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-20 py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm text-center">
                    ID
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Title</span>
                      {sortBy === "title" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm">
                    Flow ID
                  </TableHead>
                  <TableHead className="py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm">
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Created</span>
                      {sortBy === "createdAt" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Updated</span>
                      {sortBy === "updatedAt" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center py-4 bg-slate-100/80 border-b-2 font-semibold text-slate-700 text-sm">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50">
                      <TableCell>
                        <Skeleton className="w-10 h-10 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : flows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-lg">
                            No flows found
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            {search
                              ? "Try adjusting your search criteria"
                              : "Create your first flow to get started"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  flows.map((flow, index) => (
                    <TableRow key={flow.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
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
                          <p
                            className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/allflows/${flow.flow_id}`)
                            }
                          >
                            {flow.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Chat Flow Configuration
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {flow.flow_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={UtilityMethod.getStatusBadge(flow).variant}
                        >
                          {UtilityMethod.getStatusBadge(flow).text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDateToIST(flow.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDateToIST(flow.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/allflows/${flow.flow_id}`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const foundFlow = flows.find(
                                    (f) => f.id === flow.id
                                  );
                                  if (foundFlow) {
                                    setDeletingFlow(foundFlow);
                                    setDeleteModalOpen(true);
                                  }
                                }}
                                className="text-red-600"
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
          <div className="px-4 py-4 bg-slate-50/50 border-t border-slate-200/60">
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
                    onValueChange={(val) =>
                      refetch({ size: Number(val), page: 1 })
                    }
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
                        refetch({
                          page: Math.max(1, pagination.currentPage - 1),
                        })
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
                            onClick={() => refetch({ page: pageNum })}
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
                            refetch({ page: pagination.totalPages })
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
                        refetch({
                          page: Math.min(
                            pagination.totalPages,
                            pagination.currentPage + 1
                          ),
                        })
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDeleteFlow}
        title="Delete Flow"
        description="Are you sure you want to delete this flow? This action cannot be undone."
        itemName={deletingFlow?.title}
        itemDate={deletingFlow?.createdAt}
      />
    </div>
  );
}
