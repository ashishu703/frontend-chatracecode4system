"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (
    variant:
      | string
      | "default"
      | "destructive"
      | "success"
      | "warning"
      | undefined
      | null
  ) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                {getIcon(variant)}
                <span className="text-sm font-normal">
                  {title && title}
                  {description && description}
                </span>
              </div>
              <ToastClose />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
