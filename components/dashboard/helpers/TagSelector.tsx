"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FolderOpen } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TagSelectorProps {
  phonebooks: Array<{ id: number | string; name: string }>;
  value: string;
  onChange: (phonebookId: string) => void;
  label?: string;
  required?: boolean;
}

export function TagSelector({ phonebooks, value, onChange, label = "Assign to Tag", required = false }: TagSelectorProps) {
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const filteredTags = useMemo(() => 
    phonebooks.filter((phonebook) =>
      phonebook.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    ), 
    [phonebooks, tagSearchTerm]
  );

  const selectedPhonebook = phonebooks.find((p) => p.id.toString() === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showTagDropdown && !target.closest(".tag-dropdown-container")) {
        setShowTagDropdown(false);
        setTagSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTagDropdown]);

  return (
    <div>
      <Label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative tag-dropdown-container">
        <div
          onClick={() => setShowTagDropdown(!showTagDropdown)}
          className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 flex items-center justify-between"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {selectedPhonebook?.name || "Select a tag for this contact"}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showTagDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-[10000] max-h-60 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <Input
                placeholder="Search tags..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredTags.map((phonebook) => (
                <div
                  key={phonebook.id}
                  onClick={() => {
                    onChange(phonebook.id.toString());
                    setShowTagDropdown(false);
                    setTagSearchTerm("");
                  }}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-900">{phonebook.name}</span>
                  </div>
                </div>
              ))}
              {filteredTags.length === 0 && tagSearchTerm && (
                <div className="px-3 py-2 text-gray-500 text-sm text-center">
                  No tags found matching "{tagSearchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}