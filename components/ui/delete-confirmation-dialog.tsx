import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDateToIST } from "@/utils/api/utility/date.utils";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  itemDate?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  itemDate,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base text-red-600">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3">
          <p className="text-sm text-slate-700 mb-3">{description}</p>

          {(itemName || itemDate) && (
            <div className="bg-slate-50 rounded p-3 border border-slate-200">
              {itemName && (
                <p className="text-sm font-medium text-slate-800">
                  {itemName}
                </p>
              )}
              {itemDate && (
                <p className="text-xs text-slate-500 mt-1">
                  Created {formatDateToIST(itemDate)}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
