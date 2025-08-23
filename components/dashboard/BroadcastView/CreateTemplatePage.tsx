"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppPreview } from "./whatsapp-preview";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { languages } from "@/utils/languages";
import {
  whatsappTemplatesAPI,
  buildMetaTemplateBody,
} from "@/utils/api/whatsapp-templates";
import { mediaUploadAPI } from "@/utils/api/media-upload";
import { UserEndpoints, WhatsAppEndpoints } from "@/utils/api/Api-endpoints";
import { toast } from "@/hooks/use-toast";

// Constants and Types - all inline for better maintainability
const BROADCAST_TYPES = ["None", "Text", "Image", "Video", "Document"] as const;
const BUTTON_TYPES = {
  QUICK_REPLY: ["Custom"],
  CALL_TO_ACTION: [
    "Visit website",
    "Call on WhatsApp",
    "Call phone number",
    "Complete Flow",
    "Copy offer code",
  ],
} as const;

const BUTTON_LIMITS = {
  "Visit website": 2,
  "Call on WhatsApp": 1,
  "Call phone number": 1,
  "Complete Flow": 1,
  "Copy offer code": 1,
  Custom: Infinity,
} as const;

const MAX_BUTTONS = 11;
const MAX_BODY_CHARS = 1024;
const MAX_PHONE_CHARS = 20;
const MAX_URL_CHARS = 20;
const MAX_CUSTOM_CHARS = 2000;

// Types and Interfaces
interface ButtonConfig {
  id: string;
  type: string;
  text: string;
  url?: string;
  phone?: string;
}

interface VariableConfig {
  name: string;
  value: string;
}

type BroadcastType = (typeof BROADCAST_TYPES)[number];

interface TemplateFormData {
  templateName: string;
  category: string;
  language: string;
  broadcastType: BroadcastType;
  headerText: string;
  headerUrl: string;
  bodyText: string;
  footerText: string;
  buttons: ButtonConfig[];
  headerVariables: VariableConfig[];
  bodyVariables: VariableConfig[];
  showCatalogId: boolean;
  catalogId: string;
}

// Initial form data
const initialFormData: TemplateFormData = {
  templateName: "",
  category: "Marketing",
  language: "en",
  broadcastType: "Text",
  headerText: "Our {{1}} is on!",
  headerUrl: "",
  bodyText: "Shop now through {{1}} .",
  footerText: "",
  buttons: [{ id: "1", type: "Custom", text: "Unsubscribe from Promos" }],
  headerVariables: [{ name: "1", value: "Summer Sale" }],
  bodyVariables: [
    { name: "1", value: "the end of August" },
  ],
  showCatalogId: false,
  catalogId: "",
};

// Utility functions
const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const replaceVariables = (text: string, variables: VariableConfig[]): string => {
  return variables.reduce((result, variable) => {
    const regex = new RegExp(`\\{\\{${escapeRegex(variable.name)}\\}\\}`, "g");
    return result.replace(regex, variable.value);
  }, text);
};

export function BroadcastTemplateBuilder() {
  // State management
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showButtonDropdown, setShowButtonDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Computed values and utility functions - inline for better performance
  const computedValues = useMemo(() => {
    const buttonCounts = formData.buttons.reduce((acc, button) => {
      acc[button.type] = (acc[button.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      canAddMoreButtons: formData.buttons.length < MAX_BUTTONS,
      buttonTypeOptions: ["Custom", "Visit website", "Call on WhatsApp", "Call phone number", "Complete Flow", "Copy offer code"],
      isMediaType: (type: string) => type !== "Text" && type !== "None",
      headerVariableCount: formData.headerVariables.length,
      bodyVariableCount: formData.bodyVariables.length,
      buttonCounts,
    };
  }, [formData.buttons, formData.headerVariables.length, formData.bodyVariables.length]);

  const utilityFunctions = useMemo(() => ({
    getCharacterCount: (text: string, max: number) => `${String(text || "").length}/${max}`,
    getButtonLimit: (type: string) => {
      const limit = BUTTON_LIMITS[type as keyof typeof BUTTON_LIMITS];
      return limit === Infinity ? "" : `${limit} button${limit > 1 ? "s" : ""} maximum`;
    },
    canAddButtonType: (type: string) => {
      const limit = BUTTON_LIMITS[type as keyof typeof BUTTON_LIMITS];
      if (limit === Infinity) return true;
      const existingCount = computedValues.buttonCounts[type] || 0;
      return existingCount < limit;
    },
    getMaxChars: (type: string) => type === "Custom" ? MAX_CUSTOM_CHARS : MAX_URL_CHARS,
  }), [computedValues.buttonCounts]);

  const whatsAppPreviewProps = useMemo(() => ({
    headerType: formData.broadcastType,
    headerText: formData.headerText,
    headerUrl: formData.headerUrl,
    catalogEnabled: formData.showCatalogId,
    catalogId: formData.catalogId,
    bodyText: formData.bodyText,
    footerText: formData.footerText,
    buttons: formData.buttons,
  }), [
    formData.broadcastType,
    formData.headerText,
    formData.headerUrl,
    formData.showCatalogId,
    formData.catalogId,
    formData.bodyText,
    formData.footerText,
    formData.buttons
  ]);

  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.templateName.trim()) errors.push("Template name is required");
    if (!formData.category.trim()) errors.push("Category is required");
    if (!formData.bodyText.trim()) errors.push("Body text is required");
    if (formData.templateName.length > 512) errors.push("Template name must be 512 characters or less");
    if (formData.bodyText.length > 1024) errors.push("Body text must be 1024 characters or less");
    if (formData.headerText.length > 60) errors.push("Header text must be 60 characters or less");
    if (formData.footerText.length > 60) errors.push("Footer text must be 60 characters or less");

    return { isValid: errors.length === 0, errors };
  }, [formData]);

  // Form update functions
  const updateFormData = useCallback((updates: Partial<TemplateFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFormField = useCallback((field: keyof TemplateFormData, value: any) => {
      updateFormData({ [field]: value });
  }, [updateFormData]);

  const handleMediaUpload = useCallback(async (file: File) => {
    setIsUploadingMedia(true);
    
    const result = await mediaUploadAPI.uploadMediaToMeta(file, formData.templateName || 'template');

    if (result.success && result.data?.url) {
      updateFormField("headerUrl", result.data.url);
      toast({
        title: "Media Uploaded! 🎉",
        description: result.msg || "Media uploaded successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Upload Failed",
        description: result.error || "Failed to upload media",
        variant: "destructive",
      });
    }
    
    setIsUploadingMedia(false);
  }, [updateFormField, formData.templateName]);

  // Variable management functions
  const addVariable = useCallback((field: "headerText" | "bodyText") => {
    const variableCount = field === "headerText" 
      ? computedValues.headerVariableCount 
      : computedValues.bodyVariableCount;
    
    const variableNumber = variableCount + 1;
    const newText = formData[field] + ` {{${variableNumber}}}`;
    
    updateFormField(field, newText);
    
    const variableField = field === "headerText" ? "headerVariables" : "bodyVariables";
    const currentVariables = formData[variableField];
    
    updateFormField(variableField, [
      ...currentVariables,
      { name: variableNumber.toString(), value: `Variable ${variableNumber}` }
    ]);
  }, [formData, computedValues.headerVariableCount, computedValues.bodyVariableCount, updateFormField]);

  const updateVariable = useCallback((
    field: "headerVariables" | "bodyVariables",
    index: number,
    property: "name" | "value",
    value: string
  ) => {
    const currentVariables = [...formData[field]];
    // Only allow updating the value, not the name (since names are numbered)
    if (property === "value") {
      currentVariables[index] = { ...currentVariables[index], [property]: value };
      updateFormField(field, currentVariables);
    }
  }, [formData, updateFormField]);

  // Text change handler with variable sync
  const handleTextChange = useCallback((field: "headerText" | "bodyText", value: string) => {
    updateFormField(field, value);
    
    // Extract only numbered variables like {{1}}, {{2}}, etc
    const numberedVariables = value.match(/\{\{\d+\}\}/g) || [];
    const variableNumbers = numberedVariables.map(v => v.replace(/\{\{|\}\}/g, ''));
    
    const variableField = field === "headerText" ? "headerVariables" : "bodyVariables";
    const currentVariables = formData[variableField];
    
    const newVariables = variableNumbers.map(number => {
      const existing = currentVariables.find(v => v.name === number);
      return existing || { name: number, value: `Variable ${number}` };
    });
    
    // Only update if variables actually changed
    if (JSON.stringify(newVariables) !== JSON.stringify(currentVariables)) {
      updateFormField(variableField, newVariables);
    }
  }, [updateFormField, formData.headerVariables, formData.bodyVariables]);



  // Save template function
  const handleSaveTemplate = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    
    const metaTemplateBody = buildMetaTemplateBody(
      formData.templateName.trim(),
      formData.language,
      formData.category.trim(),
      formData.broadcastType,
      formData.headerText.trim(),
      formData.headerUrl.trim(),
      formData.bodyText.trim(),
      formData.footerText.trim(),
      formData.buttons,
      formData.headerVariables.map(v => v.value),
      formData.bodyVariables.map(v => v.value)
    );

    const response = await whatsappTemplatesAPI.addMetaTemplate(metaTemplateBody);

    if (response.success) {
      toast({
        title: "Success! 🎉",
        description: response.msg || "Template submitted successfully for review",
        variant: "success",
      });
      setFormData(initialFormData);
    } else {
      toast({
        title: "Submission Failed",
        description: response.msg || "Failed to save template",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  }, [formData, validateForm]);

  // Button management functions
  const addButton = useCallback((type: string) => {
      if (computedValues.canAddMoreButtons) {
        const newButton: ButtonConfig = {
          id: Date.now().toString(),
          type,
          text: type === "Custom" ? "Custom button" : type,
        };
        updateFormData({ buttons: [...formData.buttons, newButton] });
        setShowButtonDropdown(false);
      }
  }, [computedValues.canAddMoreButtons, formData.buttons, updateFormData]);

  const removeButton = useCallback((id: string) => {
    updateFormData({ buttons: formData.buttons.filter(b => b.id !== id) });
  }, [formData.buttons, updateFormData]);

  const updateButton = useCallback((id: string, field: string, value: string) => {
      updateFormData({
      buttons: formData.buttons.map(b => b.id === id ? { ...b, [field]: value } : b)
      });
  }, [formData.buttons, updateFormData]);

  // Text formatting functions
  const insertEmoji = useCallback((emoji: string) => {
      const textarea = bodyTextareaRef.current;
      if (!textarea) {
        updateFormField("bodyText", formData.bodyText + emoji);
        return;
      }

      const start = textarea.selectionStart ?? formData.bodyText.length;
      const end = textarea.selectionEnd ?? formData.bodyText.length;
      const before = formData.bodyText.slice(0, start);
      const after = formData.bodyText.slice(end);
      const next = `${before}${emoji}${after}`;

      updateFormField("bodyText", next);
    
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      });
  }, [formData.bodyText, updateFormField]);

  const wrapSelection = useCallback((startToken: string, endToken?: string) => {
      const textarea = bodyTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const selected = formData.bodyText.slice(start, end);
      const before = formData.bodyText.slice(0, start);
      const after = formData.bodyText.slice(end);
      const close = endToken ?? startToken;
      const next = `${before}${startToken}${selected}${close}${after}`;

      updateFormField("bodyText", next);
    
      requestAnimationFrame(() => {
      const cursor = start + startToken.length + selected.length + close.length;
        textarea.selectionStart = textarea.selectionEnd = cursor;
        textarea.focus();
      });
  }, [formData.bodyText, updateFormField]);

  // Render functions
  const renderVariableInputs = useCallback((variables: VariableConfig[], field: "headerVariables" | "bodyVariables") => (
    <div className="space-y-2">
      {variables.map((variable, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-12 text-center">{`{{${variable.name}}}:`}</span>
          <Input
            value={variable.value}
            onChange={(e) => updateVariable(field, index, "value", e.target.value)}
            placeholder={`Value for {{${variable.name}}}`}
            className="flex-1"
          />
        </div>
      ))}
    </div>
  ), [updateVariable]);

  const renderVariablePreview = useCallback((text: string, variables: VariableConfig[]) => (
    <div className="mt-3 p-2 bg-white rounded border">
      <div className="text-xs text-gray-500 mb-1">Preview:</div>
      <div className="text-sm text-gray-700">
        {replaceVariables(text, variables)}
      </div>
    </div>
  ), []);

  const renderHeaderInputs = useCallback(() => {
    if (formData.broadcastType === "Text") {
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Header text with variables</span>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-500 hover:bg-green-50 bg-transparent"
              onClick={() => addVariable("headerText")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variable
            </Button>
          </div>
          
          <Textarea
            placeholder="Header text (e.g., Our {{1}} is on!)"
            value={formData.headerText}
            onChange={(e) => handleTextChange("headerText", e.target.value)}
            className={`w-full resize-none ${
              formData.headerText.length > 50
                ? "border-yellow-300 focus:border-yellow-500"
                : "border-gray-200"
            }`}
            rows={2}
          />
          
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${
              formData.headerText.length > 50 ? "text-yellow-600" : "text-gray-500"
            }`}>
              {utilityFunctions.getCharacterCount(formData.headerText, 60)}
            </span>
            {formData.headerText.length > 50 && (
              <span className="text-xs text-yellow-600">Getting long</span>
            )}
          </div>

          {formData.headerText.includes("{{") && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Header Variables:</div>
              {renderVariableInputs(formData.headerVariables, "headerVariables")}
              {renderVariablePreview(formData.headerText, formData.headerVariables)}
            </div>
          )}
        </div>
      );
    }

    if (computedValues.isMediaType(formData.broadcastType)) {
      const IconComponent = formData.broadcastType === "Image" ? ImageIcon 
        : formData.broadcastType === "Video" ? VideoIcon : File;
      
      const placeholder = `https://.../${
        formData.broadcastType.toLowerCase() === "image" ? "image.png"
        : formData.broadcastType.toLowerCase() === "video" ? "video.mp4" : "file.pdf"
      }`;

      return (
        <div className="flex items-center gap-3">
          <Input
            placeholder={placeholder}
            value={formData.headerUrl}
            onChange={(e) => updateFormField("headerUrl", e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            className="bg-transparent"
            disabled={isUploadingMedia}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = formData.broadcastType === "Image" ? "image/*" 
                : formData.broadcastType === "Video" ? "video/*" 
                : "application/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleMediaUpload(file);
                }
              };
              input.click();
            }}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            {isUploadingMedia ? "Uploading..." : "Upload Media"}
          </Button>
        </div>
      );
    }

    return null;
  }, [formData, computedValues, addVariable, handleTextChange, updateFormField, utilityFunctions, renderVariableInputs, renderVariablePreview]);

  const renderButtonRow = useCallback((button: ButtonConfig) => (
      <div key={button.id} className="flex items-center gap-4">
        <Select
          value={button.type}
          onValueChange={(value) => updateButton(button.id, "type", value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
          {computedValues.buttonTypeOptions.map((type: string) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={button.text}
          onChange={(e) => updateButton(button.id, "text", e.target.value)}
          placeholder="Button label"
          className="w-48"
        />

        {button.type === "Call phone number" ? (
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">+91</div>
            <Input
              value={button.phone || ""}
            onChange={(e) => updateButton(button.id, "phone", e.target.value)}
              placeholder="Phone number"
              className="pl-12 pr-12"
            />
            <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {utilityFunctions.getCharacterCount(button.phone || "", MAX_PHONE_CHARS)}
            </div>
          </div>
        ) : button.type === "Custom" || button.type === "Call on WhatsApp" ? null : (
          <div className="relative flex-1">
            <Input
              value={button.url || ""}
              onChange={(e) => updateButton(button.id, "url", e.target.value)}
              placeholder="Enter URL"
              className={`pr-16 ${
                button.type === "Visit website" ? "border-red-300" : ""
              }`}
            />
            <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {utilityFunctions.getCharacterCount(button.url || "", utilityFunctions.getMaxChars(button.type))}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeButton(button.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
  ), [computedValues.buttonTypeOptions, updateButton, utilityFunctions, removeButton]);

  const renderButtonDropdown = useCallback(() => (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
        <div className="p-2">
          <div className="mb-2">
          <div className="font-semibold text-sm text-gray-900 px-2 py-1">Quick reply buttons</div>
            {BUTTON_TYPES.QUICK_REPLY.map((type) => (
              <button
                key={type}
                onClick={() => addButton(type)}
                disabled={!utilityFunctions.canAddButtonType(type)}
                className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {type}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div>
          <div className="font-semibold text-sm text-gray-900 px-2 py-1">Call to action buttons</div>
            {BUTTON_TYPES.CALL_TO_ACTION.map((type) => (
              <button
                key={type}
                onClick={() => addButton(type)}
                disabled={!utilityFunctions.canAddButtonType(type)}
                className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col">
                  <span>{type}</span>
                  <span className="text-xs text-gray-500">
                    {utilityFunctions.getButtonLimit(type)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
  ), [addButton, utilityFunctions]);

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50 pr-80">
      <div className="p-6 h-screen overflow-y-auto">
        {/* Template Basic Info */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.templateName}
              onChange={(e) => updateFormField("templateName", e.target.value)}
              className={`w-full ${
                !formData.templateName.trim()
                  ? "border-red-300 focus:border-red-500"
                  : formData.templateName.length > 450
                  ? "border-yellow-300 focus:border-yellow-500"
                  : ""
              }`}
              placeholder="Enter template name"
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${
                formData.templateName.length > 450 ? "text-yellow-600" : "text-gray-500"
              }`}>
                {utilityFunctions.getCharacterCount(formData.templateName, 512)}
              </span>
              {!formData.templateName.trim() && (
                <span className="text-xs text-red-500">Template name is required</span>
              )}
              {formData.templateName.length > 450 && formData.templateName.trim() && (
                  <span className="text-xs text-yellow-600">Getting long</span>
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateFormField("category", value)}
            >
              <SelectTrigger className={!formData.category.trim() ? "border-red-300 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Utility">Utility</SelectItem>
                {/* <SelectItem value="Authentication">Authentication</SelectItem> */}
              </SelectContent>
            </Select>
            {!formData.category.trim() && (
              <span className="text-xs text-red-500 mt-1">Category is required</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <Select
              value={formData.language}
              onValueChange={(value) => updateFormField("language", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Catalog ID Section */}
        <div className="mb-8 flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.showCatalogId}
              onChange={(e) => updateFormField("showCatalogId", e.target.checked)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Include Catalog ID (optional)</span>
          </label>
          {formData.showCatalogId && (
            <Input
              value={formData.catalogId}
              onChange={(e) => updateFormField("catalogId", e.target.value)}
              placeholder="Catalog ID"
              className="w-48"
            />
          )}
        </div>

        {/* Broadcast Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Broadcast title</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Highlight your brand here, use images or videos, to stand out
          </p>
          <div className="flex gap-6">
            {BROADCAST_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="broadcastType"
                  value={type}
                  checked={formData.broadcastType === type}
                  onChange={(e) => updateFormField("broadcastType", e.target.value as BroadcastType)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          <div className="mt-4">{renderHeaderInputs()}</div>
        </div>

        {/* Body Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Body</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-500 hover:bg-green-50 bg-transparent"
              onClick={() => addVariable("bodyText")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variable
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Make your messages personal using variables like <span className="text-green-600">{"{{name}}"}</span>,{" "}
            <span className="text-green-600">{"{{code}}"}</span> etc. Variables will be automatically numbered and sent to Meta API!
          </p>

          <div className="flex items-center gap-2 mb-2 p-2 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("*", "*")}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("_", "_")}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("~", "~")}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <div className="ml-auto text-sm text-gray-500">
              {utilityFunctions.getCharacterCount(formData.bodyText, MAX_BODY_CHARS)}
            </div>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-10">
              <Picker
                onSelect={(emoji: any) => {
                  if (emoji && typeof emoji.native === "string") {
                    insertEmoji(emoji.native);
                  }
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          <Textarea
            ref={bodyTextareaRef}
            value={formData.bodyText}
            onChange={(e) => handleTextChange("bodyText", e.target.value)}
            className={`min-h-[120px] resize-none border p-3 ${
              !formData.bodyText.trim()
                ? "border-red-300 focus:border-red-500"
                : formData.bodyText.length > 900
                ? "border-yellow-300 focus:border-yellow-500"
                : "border-gray-200"
            }`}
            placeholder="Template Message (e.g., Shop now through {{1}} and use code {{2}} to get {{3}} off!)"
          />

          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${
              formData.bodyText.length > 900 ? "text-yellow-600" : "text-gray-500"
            }`}>
              {utilityFunctions.getCharacterCount(formData.bodyText, MAX_BODY_CHARS)}
            </span>
            {!formData.bodyText.trim() && (
              <span className="text-xs text-red-500">Body text is required</span>
            )}
            {formData.bodyText.length > 900 && formData.bodyText.trim() && (
              <span className="text-xs text-yellow-600">Getting long</span>
            )}
          </div>

          {formData.bodyText.includes("{{") && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Body Variables:</div>
              {renderVariableInputs(formData.bodyVariables, "bodyVariables")}
              {renderVariablePreview(formData.bodyText, formData.bodyVariables)}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Footer</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Footers are great to add any disclaimers or to add a thoughtful PS
          </p>
          <div className="relative">
            <Textarea
              value={formData.footerText}
              onChange={(e) => updateFormField("footerText", e.target.value)}
              className={`resize-none border ${
                formData.footerText.length > 50
                  ? "border-yellow-300 focus:border-yellow-500"
                  : "border-gray-200"
              }`}
              rows={2}
              placeholder="Add footer text (optional)"
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${
                formData.footerText.length > 50 ? "text-yellow-600" : "text-gray-500"
              }`}>
                {utilityFunctions.getCharacterCount(formData.footerText, 60)}
              </span>
              {formData.footerText.length > 50 && (
                <span className="text-xs text-yellow-600">Getting long</span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Buttons</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create up to {MAX_BUTTONS} buttons that let customers respond to your message or take action.
          </p>

          <div className="space-y-4">
            {formData.buttons.map(renderButtonRow)}

            {computedValues.canAddMoreButtons && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowButtonDropdown(!showButtonDropdown)}
                  className="border-dashed border-gray-300 text-gray-600 hover:border-gray-400 bg-transparent flex items-center justify-between px-4 py-2"
                >
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add button
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showButtonDropdown && renderButtonDropdown()}
              </div>
            )}

            {!computedValues.canAddMoreButtons && (
              <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Maximum {MAX_BUTTONS} buttons reached
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-4 mt-10">
          <div className="flex justify-end gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveTemplate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Save and Submit"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Preview */}
      <div className="fixed right-4 top-20 rounded-[2.5rem] h-auto w-80 border-l border-gray-200 overflow-hidden">
        <WhatsAppPreview {...whatsAppPreviewProps} />
      </div>
    </div>
  );
}
