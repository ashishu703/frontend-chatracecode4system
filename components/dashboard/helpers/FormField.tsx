"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: ReactNode;
}

export function FormField({ label, required = false, children, hint }: FormFieldProps) {
  return (
    <div>
      <Label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <div className="mb-1">{hint}</div>}
      {children}
    </div>
  );
}