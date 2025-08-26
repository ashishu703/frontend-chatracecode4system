"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: Trash2,
          iconColor: "text-red-500",
          buttonColor: "bg-red-500 hover:bg-red-600",
          borderColor: "border-red-200"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
          buttonColor: "bg-yellow-500 hover:bg-yellow-600",
          borderColor: "border-yellow-200"
        }
      case "info":
        return {
          icon: AlertTriangle,
          iconColor: "text-blue-500",
          buttonColor: "bg-blue-500 hover:bg-blue-600",
          borderColor: "border-blue-200"
        }
      default:
        return {
          icon: Trash2,
          iconColor: "text-red-500",
          buttonColor: "bg-red-500 hover:bg-red-600",
          borderColor: "border-red-200"
        }
    }
  }

  const styles = getVariantStyles()
  const IconComponent = styles.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.borderColor} bg-opacity-10`}>
              <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.buttonColor} text-white flex-1`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
