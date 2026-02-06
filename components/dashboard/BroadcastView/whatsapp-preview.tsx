"use client";
import {
  MessageCircle,
  ExternalLink,
  Smartphone,
  Code,
  Play,
  Zap,
  Star,
  List,
} from "lucide-react";

interface ButtonConfig {
  id: string;
  type: string;
  text: string;
  url?: string;
  phone?: string;
}

interface WhatsAppPreviewProps {
  headerType?: "None" | "Text" | "Image" | "Video" | "Document";
  headerText?: string;
  headerUrl?: string;
  catalogEnabled?: boolean;
  catalogId?: string;
  bodyText: string;
  footerText: string;
  buttons: ButtonConfig[];
}

export function WhatsAppPreview({
  headerType = "None",
  headerText = "",
  headerUrl = "",
  catalogEnabled = false,
  catalogId = "",
  bodyText,
  footerText,
  buttons,
}: WhatsAppPreviewProps) {
  // Use media proxy for external URLs (e.g. ngrok) to bypass browser warning splash
  const getMediaDisplayUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/")) return url; // relative URL, use as-is
    if (url.startsWith("http")) {
      return `/api/media/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Function to get appropriate icon for button type
  const getButtonIcon = (buttonType: string) => {
    switch (buttonType) {
      case "Visit website":
        return <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />;
      case "Call on WhatsApp":
        return <MessageCircle className="w-4 h-4 mr-2 text-green-500" />;
      case "Call phone number":
        return <Smartphone className="w-4 h-4 mr-2 text-blue-600" />;
      case "Copy offer code":
        return <Code className="w-4 h-4 mr-2 text-purple-500" />;
      case "Complete Flow":
        return <Play className="w-4 h-4 mr-2 text-orange-500" />;
      case "Custom":
        return <Star className="w-4 h-4 mr-2 text-yellow-500" />;
      default:
        return <Zap className="w-4 h-4 mr-2 text-gray-500" />;
    }
  };
  return (
    <div className="w-80 h-[600px] bg-white rounded-[2.5rem] shadow-2xl border-8 border-gray-200 overflow-hidden">
      {/* WhatsApp Header */}
      <div className="bg-[#128C7E] h-20 flex items-end pb-3 px-4">
        <div className="w-full h-8"></div>
      </div>

      {/* Message Content */}
      <div
        className="bg-[#ECE5DD] relative overflow-hidden h-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c4b5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Cpath d='M30 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 2c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Security Notice */}
        <div className="flex items-center justify-center py-2 px-4">
          <div className="bg-gray-300 rounded-lg px-3 py-1 flex items-center text-xs text-gray-600 max-w-[280px]">
            <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center mr-2 text-white font-bold text-[10px] flex-shrink-0">
              i
            </div>
            <span className="text-left">
              This business uses a secure service from Meta to manage this chat.
              Tap to learn more
            </span>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="px-4 py-2 flex justify-center pb-8">
          <div className="bg-white rounded-lg p-2 max-w-[250px] shadow-sm">
            {/* Optional header */}
            {headerType !== "None" && (
              <div className="mb-2 text-left">
                {headerType === "Text" && (
                  <div className="text-[10px] text-gray-700 font-semibold text-left">
                    {headerText}
                  </div>
                )}
                {headerType === "Image" && headerUrl && (
                  <img
                    src={getMediaDisplayUrl(headerUrl)}
                    alt="header"
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                {headerType === "Video" && headerUrl && (
                  <div className="w-full">
                    <video
                      src={getMediaDisplayUrl(headerUrl)}
                      controls
                      className="w-full rounded"
                    />
                  </div>
                )}
                {headerType === "Document" && headerUrl && (
                  <a
                    href={getMediaDisplayUrl(headerUrl)}
                    target="_blank"
                    className="text-blue-600 text-xs underline"
                  >
                    View document
                  </a>
                )}
              </div>
            )}
            <div className="text-gray-800 text-xs whitespace-pre-wrap mb-1 text-left">
              {String(bodyText || "Hello")}
            </div>
            {/* Catalog preview */}
            {catalogEnabled && (
              <div className="mt-2 border rounded p-2 bg-gray-50">
                <div className="text-xs text-gray-700 font-semibold">
                  Catalog
                </div>
                <div className="text-[10px] text-gray-500">
                  ID: {catalogId || "preview"}
                </div>
                <div className="mt-1 h-16 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-600">
                  Catalog preview
                </div>
              </div>
            )}
            {footerText && (
              <div className="text-gray-500 text-[10px] mt-2 text-left">
                {String(footerText)}
              </div>
            )}

            {/* Action Buttons - Inside message bubble */}
            {buttons && buttons.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                {/* Show first 2 buttons properly */}
                {buttons.slice(0, 2).map((button, index) => (
                  <div
                    key={button.id}
                    className="flex items-center justify-center py-1.5 border-b border-gray-100"
                  >
                    {getButtonIcon(button.type)}
                    <span className="text-gray-700 font-medium text-xs">
                      {String(button.text || "Button")}
                    </span>
                  </div>
                ))}

                {/* Show "See all options" button if more than 2 buttons */}
                {buttons.length > 2 && (
                  <div className="flex items-center justify-center py-1.5">
                    <List className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-blue-500 font-medium text-xs">
                      See all options
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="text-gray-400 text-[10px] mt-1 text-right">
              11:27 AM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
