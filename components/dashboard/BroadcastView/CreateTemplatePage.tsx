"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  Plus,
  Trash2,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  ImageIcon,
  VideoIcon,
  File,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Phone,
  ClipboardList,
  MessageCircle,
  Copy,
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
import { languages } from "@/utils/api/utility/languages";
import {
  whatsappTemplatesAPI,
  buildMetaTemplateBody,
} from "@/utils/api/broadcast/whatsapp-templates";
import { toast } from "@/hooks/use-toast";
import { mediaUploadAPI } from "@/utils/api/broadcast/media-upload";
import { useAbortController } from "@/hooks/useAbortController";

// Constants
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
  Custom: Number.POSITIVE_INFINITY,
} as const;

const MAX_BUTTONS = 11;
const MAX_BODY_CHARS = 1024;
const MAX_PHONE_CHARS = 20;
const MAX_URL_CHARS = 20;
const MAX_CUSTOM_CHARS = 2000;
interface ButtonConfig {
  id: string;
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
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
  headerHash: string;
  bodyText: string;
  footerText: string;
  buttons: ButtonConfig[];
  headerVariables: VariableConfig[];
  bodyVariables: VariableConfig[];
  showCatalogId: boolean;
  catalogId: string;
}
const initialFormData: TemplateFormData = {
  templateName: "",
  category: "Marketing",
  language: "en",
  broadcastType: "Text",
  headerText: "",
  headerUrl: "",
  headerHash: "",
  bodyText: "Shop now through {{1}} .",
  footerText: "",
  buttons: [],
  headerVariables: [],
  bodyVariables: [{ name: "1", value: "the end of August" }],
  showCatalogId: false,
  catalogId: "",
};

export function BroadcastTemplateBuilder() {
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showButtonDropdown, setShowButtonDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { createController, abortController } = useAbortController();
  const computedValues = useMemo(() => {
    const buttonCounts = formData.buttons.reduce((acc, button) => {
      acc[button.type] = (acc[button.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      canAddMoreButtons: formData.buttons.length < MAX_BUTTONS,
      buttonTypeOptions: [
        "Custom",
        "Visit website",
        "Call on WhatsApp",
        "Call phone number",
        "Complete Flow",
        "Copy offer code",
      ],
      isMediaType: (type: string) => type !== "Text" && type !== "None",
      headerVariableCount: formData.headerVariables.length,
      bodyVariableCount: formData.bodyVariables.length,
      buttonCounts,
    };
  }, [
    formData.buttons,
    formData.headerVariables.length,
    formData.bodyVariables.length,
  ]);

  const varRegex = useMemo(() => /\{\{\d+\}\}/g, []);

  const whatsAppPreviewProps = useMemo(
    () => ({
      headerType: formData.broadcastType,
      headerText: formData.headerText,
      headerUrl: formData.headerUrl,
      catalogEnabled: formData.showCatalogId,
      catalogId: formData.catalogId,
      bodyText: formData.bodyText,
      footerText: formData.footerText,
      buttons: formData.buttons,
    }),
    [
      formData.broadcastType,
      formData.headerText,
      formData.headerUrl,
      formData.showCatalogId,
      formData.catalogId,
      formData.bodyText,
      formData.footerText,
      formData.buttons,
    ]
  );

  const validateForm = useCallback((): {
    isValid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};
    if (!formData.templateName.trim()) {
      errors.templateName = "Template name is required";
    } else if (formData.templateName.length > 512) {
      errors.templateName = "Template name must be 512 characters or less";
    }
    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }
    if (!formData.bodyText.trim()) {
      errors.bodyText = "Body text is required";
    } else if (formData.bodyText.length > 1024) {
      errors.bodyText = "Body text must be 1024 characters or less";
    }
    if (formData.headerText.length > 60) {
      errors.headerText = "Header text must be 60 characters or less";
    }
    if (formData.footerText.length > 60) {
      errors.footerText = "Footer text must be 60 characters or less";
    }
    formData.buttons.forEach((button, index) => {
      const buttonKey = `button_${index}`;

      if (!button.text.trim()) {
        errors[`${buttonKey}_text`] = "Button text is required";
      }

      if (button.type === "Call phone number") {
        if (!button.phone_number || button.phone_number.length < 10) {
          errors[`${buttonKey}_phone`] =
            "Phone number is required and must be at least 10 digits";
        }
      }

      if (button.type === "Copy offer code" && !button.url) {
        errors[`${buttonKey}_url`] = "Offer code is required";
      }

      if (button.type === "Visit website" && !button.url) {
        errors[`${buttonKey}_url`] = "URL is required for Visit website button";
      }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  }, [formData]);
  const updateFormData = useCallback((updates: Partial<TemplateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateFormField = useCallback(
    (field: keyof TemplateFormData, value: any) => {
      let processedValue = value;
      if (field === "templateName") {
        processedValue = value.replace(/\s+/g, "_").toLowerCase();
      }
      setFormData((prev) => ({ ...prev, [field]: processedValue }));
    },
    []
  );

  const handleMediaUpload = useCallback(
    async (file: File) => {
      createController("media-upload");
      setIsUploadingMedia(true);

      try {
        const result = await mediaUploadAPI.uploadMediaToMeta(
          file,
          formData.templateName,
          {
            abortKey: "media-upload",
          }
        );

        if (result.success && result.url) {
          updateFormField("headerUrl", result.url);
          if (result.hash) {
            updateFormField("headerHash", result.hash);
          }
                     toast({
             title: "Media Uploaded",
             description: `Media uploaded successfully: ${file.name}`,
             variant: "success",
           });
                 } else {
           toast({
             title: "Upload Failed",
             description: "Failed to upload media file",
             variant: "destructive",
           });
         }
      } catch (error: any) {
        if (error.message === "Request cancelled") {
          console.log("Media upload cancelled");
                     toast({
             title: "Upload Cancelled",
             description: "Media upload was cancelled",
             variant: "default",
           });
                 } else {
           toast({
             title: "Upload Failed",
             description: "An error occurred during media upload",
             variant: "destructive",
           });
         }
      } finally {
        setIsUploadingMedia(false);
      }
    },
    [updateFormField, formData.templateName, createController]
  );
  const addVariable = useCallback((field: "headerText" | "bodyText") => {
    setFormData((prev) => {
      const variableCount =
        field === "headerText"
          ? prev.headerVariables.length
          : prev.bodyVariables.length;

      const variableNumber = variableCount + 1;
      const newText = prev[field] + ` {{${variableNumber}}}`;

      const variableField =
        field === "headerText" ? "headerVariables" : "bodyVariables";
      const currentVariables = prev[variableField];

      return {
        ...prev,
        [field]: newText,
        [variableField]: [
          ...currentVariables,
          {
            name: variableNumber.toString(),
            value: `Variable ${variableNumber}`,
          },
        ],
      };
    });
  }, []);

  const updateVariable = useCallback(
    (
      field: "headerVariables" | "bodyVariables",
      index: number,
      property: "name" | "value",
      value: string
    ) => {
      if (property !== "value") return;
      setFormData((prev) => {
        const nextVars = [...prev[field]];
        nextVars[index] = { ...nextVars[index], value };
        return { ...prev, [field]: nextVars };
      });
    },
    []
  );

  // Text change handler with variable sync
  const handleTextChange = useCallback(
    (field: "headerText" | "bodyText", value: string) => {
      setFormData((prev) => {
        const matches = value.match(varRegex) || [];
        const variableNumbers = matches.map((v) => v.slice(2, -2));
        const variableField =
          field === "headerText" ? "headerVariables" : "bodyVariables";
        const currentVariables = prev[variableField];

        const newVariables = variableNumbers.map((number) => {
          const existing = currentVariables.find((v) => v.name === number);
          return existing || { name: number, value: `Variable ${number}` };
        });

        return {
          ...prev,
          [field]: value,
          [variableField]: newVariables,
        };
      });
    },
    [varRegex]
  );
  const handleSaveTemplate = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    createController("template-submit");
    setIsSubmitting(true);

    try {
      const headerValue =
        formData.broadcastType !== "Text" &&
        formData.broadcastType !== "None" &&
        formData.headerHash
          ? formData.headerHash
          : formData.headerUrl.trim();

      const metaTemplateBody = buildMetaTemplateBody(
        formData.templateName.trim().replace(/\s+/g, "_").toLowerCase(),
        formData.language,
        formData.category.trim(),
        formData.broadcastType,
        formData.headerText.trim(),
        headerValue,
        formData.bodyText.trim(),
        formData.footerText.trim(),
        formData.buttons,
        formData.headerVariables.map((v) => v.value),
        formData.bodyVariables.map((v) => v.value)
      );

      const response = await whatsappTemplatesAPI.addMetaTemplate(
        metaTemplateBody,
        {
          abortKey: "template-submit",
        }
      );

             if (response.success) {
         toast({
           title: "Template Submitted",
           description: `Template "${formData.templateName}" submitted successfully`,
           variant: "success",
         });
        setFormData(initialFormData);
        setValidationErrors({});
             } else {
         toast({
           title: "Submission Failed",
           description: "Failed to submit template",
           variant: "destructive",
         });
       }
    } catch (error: any) {
      if (error.message === "Request cancelled") {
        console.log("Template submission cancelled");
                 toast({
           title: "Submission Cancelled",
           description: "Template submission was cancelled",
           variant: "default",
         });
             } else {
         toast({
           title: "Submission Failed",
           description: "An error occurred during template submission",
           variant: "destructive",
         });
       }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, createController]);
  const addButton = useCallback((type: string) => {
    setFormData((prev) => {
      if (prev.buttons.length >= MAX_BUTTONS) return prev;

      const safeId = `btn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newButton: ButtonConfig = {
        id: safeId,
        type,
        text:
          type === "Custom"
            ? "Custom button"
            : type === "Copy offer code"
            ? "Copy Code"
            : type === "Call phone number"
            ? "Call"
            : type,
      };

      setShowButtonDropdown(false);
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("button_")) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });

      return { ...prev, buttons: [...prev.buttons, newButton] };
    });
  }, []);

  const removeButton = useCallback((id: string) => {
    setFormData((prev) => {
      const buttonIndex = prev.buttons.findIndex((b) => b.id === id);
      if (buttonIndex !== -1) {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`button_${buttonIndex}_`)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });
      }

      return { ...prev, buttons: prev.buttons.filter((b) => b.id !== id) };
    });
  }, []);

  const updateButton = useCallback(
    (id: string, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        buttons: prev.buttons.map((b) =>
          b.id === id ? { ...b, [field]: value } : b
        ),
      }));
    },
    []
  );
  const insertEmoji = useCallback(
    (emoji: string) => {
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
    },
    [formData.bodyText, updateFormField]
  );

  const wrapSelection = useCallback(
    (startToken: string, endToken?: string) => {
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
        const cursor =
          start + startToken.length + selected.length + close.length;
        textarea.selectionStart = textarea.selectionEnd = cursor;
        textarea.focus();
      });
    },
    [formData.bodyText, updateFormField]
  );

  const renderVariableInputs = useCallback(
    (
      variables: VariableConfig[],
      field: "headerVariables" | "bodyVariables"
    ) => (
      <div className="space-y-2">
        {variables.map((variable, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-12 text-center">{`{{${variable.name}}}:`}</span>
            <Input
              value={variable.value}
              onChange={(e) =>
                updateVariable(field, index, "value", e.target.value)
              }
              placeholder={`Value for {{${variable.name}}}`}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    ),
    [updateVariable]
  );

  const renderHeaderInputs = useCallback(() => {
    if (formData.broadcastType === "Text") {
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Header text with variables
            </span>
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
            <span
              className={`text-xs ${
                formData.headerText.length > 50
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              {`${formData.headerText.length}/60`}
            </span>
            {formData.headerText.length > 50 && (
              <span className="text-xs text-yellow-600">Getting long</span>
            )}
          </div>

          {formData.headerText.includes("{{") && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Header Variables:
              </div>
              {renderVariableInputs(
                formData.headerVariables,
                "headerVariables"
              )}
            </div>
          )}
        </div>
      );
    }

    if (computedValues.isMediaType(formData.broadcastType)) {
      const IconComponent =
        formData.broadcastType === "Image"
          ? ImageIcon
          : formData.broadcastType === "Video"
          ? VideoIcon
          : File;

      const placeholder = `https://.../${
        formData.broadcastType.toLowerCase() === "image"
          ? "image.png"
          : formData.broadcastType.toLowerCase() === "video"
          ? "video.mp4"
          : "file.pdf"
      }`;

      return (
        <div className="flex items-center gap-3">
          <Input
            placeholder={placeholder}
            value={formData.headerUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, headerUrl: e.target.value }))
            }
            className="flex-1"
          />
          <Button
            variant="outline"
            className="bg-transparent"
            disabled={isUploadingMedia}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept =
                formData.broadcastType === "Image"
                  ? "image/*"
                  : formData.broadcastType === "Video"
                  ? "video/*"
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
            {isUploadingMedia ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Uploading...
              </div>
            ) : (
              <>
                <IconComponent className="w-4 h-4 mr-2" />
                Upload Media
              </>
            )}
          </Button>
        </div>
      );
    }

    return null;
  }, [
    formData,
    computedValues,
    addVariable,
    handleTextChange,
    updateFormField,
    renderVariableInputs,
    isUploadingMedia,
    handleMediaUpload,
  ]);

  const renderButtonRow = useCallback(
    (button: ButtonConfig, index: number) => {
      const textErrKey = `button_${index}_text`;
      const phoneErrKey = `button_${index}_phone`;
      const urlErrKey = `button_${index}_url`;

      return (
        <div key={button.id} className="flex items-center gap-4">
          <Select
            value={button.type}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                buttons: prev.buttons.map((b) =>
                  b.id === button.id ? { ...b, type: value } : b
                ),
              }))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {computedValues.buttonTypeOptions.map((type: string) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    {type === "Custom" && <ArrowRight className="w-4 h-4" />}
                    {type === "Visit website" && (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    {type === "Call on WhatsApp" && (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {type === "Call phone number" && (
                      <Phone className="w-4 h-4" />
                    )}
                    {type === "Complete Flow" && (
                      <ClipboardList className="w-4 h-4" />
                    )}
                    {type === "Copy offer code" && <Copy className="w-4 h-4" />}
                    {type}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              value={button.text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buttons: prev.buttons.map((b) =>
                    b.id === button.id ? { ...b, text: e.target.value } : b
                  ),
                }))
              }
              placeholder="Button label"
              className={`w-48 ${
                validationErrors[textErrKey]
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200"
              }`}
            />
            {validationErrors[textErrKey] && (
              <div className="text-xs text-red-500 mt-1">
                {validationErrors[textErrKey]}
              </div>
            )}
          </div>

          {button.type === "Call phone number" ? (
            <div className="relative flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 z-10">
                  +91
                </div>
                <Input
                  value={button.phone_number || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buttons: prev.buttons.map((b) =>
                        b.id === button.id
                          ? { ...b, phone_number: e.target.value }
                          : b
                      ),
                    }))
                  }
                  placeholder="Phone number"
                  className={`pl-12 pr-12 ${
                    validationErrors[phoneErrKey]
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200"
                  }`}
                />
                <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                  {`${(button.phone_number || "").length}/${MAX_PHONE_CHARS}`}
                </div>
              </div>
              {validationErrors[phoneErrKey] && (
                <div className="text-xs text-red-500 mt-1">
                  {validationErrors[phoneErrKey]}
                </div>
              )}
            </div>
          ) : button.type === "Copy offer code" ? (
            <div className="relative flex-1">
              <Input
                value={button.url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buttons: prev.buttons.map((b) =>
                      b.id === button.id ? { ...b, url: e.target.value } : b
                    ),
                  }))
                }
                placeholder="Enter offer code (e.g., SUMMER20)"
                className={`pr-16 ${
                  validationErrors[urlErrKey]
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200"
                }`}
              />
              <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                {`${(button.url || "").length}/${MAX_URL_CHARS}`}
              </div>
              {validationErrors[urlErrKey] && (
                <div className="text-xs text-red-500 mt-1">
                  {validationErrors[urlErrKey]}
                </div>
              )}
            </div>
          ) : button.type === "Custom" ||
            button.type === "Call on WhatsApp" ? null : (
            <div className="relative flex-1">
              <Input
                value={button.url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buttons: prev.buttons.map((b) =>
                      b.id === button.id ? { ...b, url: e.target.value } : b
                    ),
                  }))
                }
                placeholder="Enter URL"
                className={`pr-16 ${
                  validationErrors[urlErrKey]
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200"
                }`}
              />
              <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                {`${(button.url || "").length}/${
                  button.type === "Custom" ? MAX_CUSTOM_CHARS : MAX_URL_CHARS
                }`}
              </div>
              {validationErrors[urlErrKey] && (
                <div className="text-xs text-red-500 mt-1">
                  {validationErrors[urlErrKey]}
                </div>
              )}
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
      );
    },
    [
      computedValues.buttonTypeOptions,
      updateButton,
      removeButton,
      validationErrors,
      formData.buttons,
    ]
  );

  const renderButtonDropdown = useCallback(
    () => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto w-96">
        <div className="p-3">
          <div className="mb-2">
            <div className="font-medium text-sm text-gray-700 px-2 py-1 mb-1">
              Quick reply buttons
            </div>
            {BUTTON_TYPES.QUICK_REPLY.map((type) => (
              <button
                key={type}
                onClick={() => addButton(type)}
                disabled={(() => {
                  const limit =
                    BUTTON_LIMITS[type as keyof typeof BUTTON_LIMITS];
                  if (limit === Number.POSITIVE_INFINITY) return false;
                  const existingCount = computedValues.buttonCounts[type] || 0;
                  return existingCount >= limit;
                })()}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 rounded-md transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{type}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div>
            <div className="font-medium text-sm text-gray-700 px-2 py-1 mb-1">
              Call to action buttons
            </div>
            {BUTTON_TYPES.CALL_TO_ACTION.map((type) => (
              <button
                key={type}
                onClick={() => addButton(type)}
                disabled={(() => {
                  const limit =
                    BUTTON_LIMITS[type as keyof typeof BUTTON_LIMITS];
                  if (limit === Number.POSITIVE_INFINITY) return false;
                  const existingCount = computedValues.buttonCounts[type] || 0;
                  return existingCount >= limit;
                })()}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 rounded-md transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  {type === "Visit website" && (
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  )}
                  {type === "Call on WhatsApp" && (
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  )}
                  {type === "Call phone number" && (
                    <Phone className="w-4 h-4 text-red-600" />
                  )}
                  {type === "Complete Flow" && (
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                  )}
                  {type === "Copy offer code" && (
                    <Copy className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{type}</span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const limit =
                        BUTTON_LIMITS[type as keyof typeof BUTTON_LIMITS];
                      return limit === Number.POSITIVE_INFINITY
                        ? ""
                        : `${limit} button${limit > 1 ? "s" : ""} maximum`;
                    })()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    [addButton]
  );

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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  templateName: e.target.value
                    .replace(/\s+/g, "_")
                    .toLowerCase(),
                }))
              }
              className={`w-full ${
                validationErrors.templateName
                  ? "border-red-300 focus:border-red-500"
                  : formData.templateName.length > 450
                  ? "border-yellow-300 focus:border-yellow-500"
                  : ""
              }`}
              placeholder="Enter template name"
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  formData.templateName.length > 450
                    ? "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                {`${formData.templateName.length}/512`}
              </span>
              {validationErrors.templateName && (
                <span className="text-xs text-red-500">
                  {validationErrors.templateName}
                </span>
              )}
              {formData.templateName.length > 450 &&
                formData.templateName.trim() && (
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
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger
                className={
                  validationErrors.category
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Utility">Utility</SelectItem>
                {/* <SelectItem value="Authentication">Authentication</SelectItem> */}
              </SelectContent>
            </Select>
            {validationErrors.category && (
              <span className="text-xs text-red-500 mt-1">
                {validationErrors.category}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <Select
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Catalog ID Section - Hidden for now */}
        {/* <div className="mb-8 flex items-center gap-4">
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
        </div> */}

        {/* Broadcast Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">
              Broadcast title
            </h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Highlight your brand here, use images or videos, to stand out
          </p>
          <div className="flex gap-6">
            {BROADCAST_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="broadcastType"
                  value={type}
                  checked={formData.broadcastType === type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      broadcastType: e.target.value as BroadcastType,
                    }))
                  }
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
            Make your messages personal using variables like{" "}
            <span className="text-green-600">{"{{1}}"}</span>,{" "}
            <span className="text-green-600">{"{{2}}"}</span> etc. Variables
            will be automatically numbered and sent to Meta API!
          </p>

          <div className="flex items-center gap-2 mb-2 p-2 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => wrapSelection("*", "*")}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => wrapSelection("_", "_")}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => wrapSelection("~", "~")}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <div className="ml-auto text-sm text-gray-500">{`${formData.bodyText.length}/${MAX_BODY_CHARS}`}</div>
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
              validationErrors.bodyText
                ? "border-red-300 focus:border-red-500"
                : formData.bodyText.length > 900
                ? "border-yellow-300 focus:border-yellow-500"
                : "border-gray-200"
            }`}
            placeholder="Template Message (e.g., Shop now through {{1}} and use code {{2}} to get {{3}} off!)"
          />

          <div className="flex justify-between items-center mt-1">
            <span
              className={`text-xs ${
                formData.bodyText.length > 900
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              {`${formData.bodyText.length}/${MAX_BODY_CHARS}`}
            </span>
            {validationErrors.bodyText && (
              <span className="text-xs text-red-500">
                {validationErrors.bodyText}
              </span>
            )}
            {formData.bodyText.length > 900 && formData.bodyText.trim() && (
              <span className="text-xs text-yellow-600">Getting long</span>
            )}
          </div>

          {formData.bodyText.includes("{{") && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Body Variables:
              </div>
              {renderVariableInputs(formData.bodyVariables, "bodyVariables")}
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, footerText: e.target.value }))
              }
              className={`resize-none border ${
                formData.footerText.length > 50
                  ? "border-yellow-300 focus:border-yellow-500"
                  : "border-gray-200"
              }`}
              rows={2}
              placeholder="Add footer text (optional)"
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  formData.footerText.length > 50
                    ? "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                {`${formData.footerText.length}/60`}
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
            Create up to {MAX_BUTTONS} buttons that let customers respond to
            your message or take action.
          </p>

          <div className="space-y-4">
            {formData.buttons.map((btn, i) => renderButtonRow(btn, i))}

            {computedValues.canAddMoreButtons && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowButtonDropdown(!showButtonDropdown)}
                  className="border-dashed border-gray-300 text-gray-600 hover:border-gray-400 bg-transparent flex items-center justify-between px-4 py-2 w-48"
                >
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add button
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showButtonDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 z-20">
                    {renderButtonDropdown()}
                  </div>
                )}
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
