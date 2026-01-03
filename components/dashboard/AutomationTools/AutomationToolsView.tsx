"use client";

import { useState, useEffect } from "react";
import { Zap, Facebook, Instagram, Mails, QrCode, FileText, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CommentManager from "./FacebookCommentReply";
import InstagramCommentManager from "./InstagramCommentReply";
import AllDripCampaign from "./AllDripCampaign";
import DripCampaign from "./DripCampaign";
import QRGenerator from "./QRGenerator";
import CommentLogs from "./CommentLogs";
import { facebookCommentAPI, instagramCommentAPI } from "@/utils/api/comment-automation/comment-automation-api";
import { useToast } from "@/hooks/use-toast";

interface ToolStatus {
  isActive: boolean;
  isConfigured: boolean;
}

interface AutomationToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  platform?: 'facebook' | 'instagram';
}

const automationTools: AutomationToolCard[] = [
  {
    id: "facebook",
    title: "Facebook Comments",
    description: "Automate responses to comments on your Facebook posts and engage with your audience automatically.",
    icon: Facebook,
    iconColor: "bg-blue-600",
    borderColor: "border-blue-200",
    platform: 'facebook',
  },
  {
    id: "instagram",
    title: "Instagram Comments",
    description: "Automatically reply to comments and mentions on Instagram to keep your audience engaged.",
    icon: Instagram,
    iconColor: "bg-gradient-to-br from-purple-500 to-pink-500",
    borderColor: "border-purple-200",
    platform: 'instagram',
  },
  {
    id: "qr_generator",
    title: "QR Generator",
    description: "Generate dynamic QR codes for multiple business purposes and track their performance.",
    icon: QrCode,
    iconColor: "bg-indigo-600",
    borderColor: "border-indigo-200",
  },
  {
    id: "drip_campaigns",
    title: "Drip Campaigns",
    description: "Nurture leads and customers with automated message sequences and personalized workflows.",
    icon: Mails,
    iconColor: "bg-green-600",
    borderColor: "border-green-200",
  },
  {
    id: "triggers",
    title: "Triggers",
    description: "Start flows based on specific keywords or actions to automate your business processes.",
    icon: Zap,
    iconColor: "bg-yellow-600",
    borderColor: "border-yellow-200",
  },
];

export default function AutomationGrid() {
  const { toast } = useToast();
  const [toolStatuses, setToolStatuses] = useState<Record<string, ToolStatus>>({});
  const [showToolContent, setShowToolContent] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'instagram' | null>(null);
  const [viewMode, setViewMode] = useState<'tools' | 'settings' | 'content' | 'logs'>('tools');
  const [dripCampaignView, setDripCampaignView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>('');

  useEffect(() => {
    loadToolStatuses();
  }, []);

  const loadToolStatuses = async () => {
    const statuses: Record<string, ToolStatus> = {};
    
    try {
      const fbResponse = await facebookCommentAPI.getSettings();
      if (fbResponse.success && fbResponse.data) {
        statuses.facebook = {
          isActive: fbResponse.data.is_active || false,
          isConfigured: !!fbResponse.data,
        };
      } else {
        statuses.facebook = { isActive: false, isConfigured: false };
      }
    } catch (error) {
      statuses.facebook = { isActive: false, isConfigured: false };
    }

    try {
      const igResponse = await instagramCommentAPI.getSettings();
      if (igResponse.success && igResponse.data) {
        statuses.instagram = {
          isActive: igResponse.data.is_active || false,
          isConfigured: !!igResponse.data,
        };
      } else {
        statuses.instagram = { isActive: false, isConfigured: false };
      }
    } catch (error) {
      statuses.instagram = { isActive: false, isConfigured: false };
    }

    statuses.qr_generator = { isActive: true, isConfigured: true };
    statuses.drip_campaigns = { isActive: true, isConfigured: true };
    statuses.triggers = { isActive: false, isConfigured: false };

    setToolStatuses(statuses);
  };

  const handleToggle = async (toolId: string, currentStatus: boolean) => {
    if (toolId === 'facebook' || toolId === 'instagram') {
      try {
        const api = toolId === 'facebook' ? facebookCommentAPI : instagramCommentAPI;
        const response = await api.getSettings();
        
        if (response.success && response.data) {
          const updatedSettings: any = {
            privateReplyType: response.data.private_reply_type || response.data.privateReplyType || 'none',
            publicReplyType: response.data.public_reply_type || response.data.publicReplyType || 'none',
            replyTo: response.data.reply_to || response.data.replyTo || 'all',
            trackComments: response.data.track_comments || response.data.trackComments || 'all',
            isActive: !currentStatus,
          };

          if (response.data.private_reply_text) updatedSettings.privateReplyText = response.data.private_reply_text;
          if (response.data.private_reply_flow_id) updatedSettings.privateReplyFlowId = response.data.private_reply_flow_id;
          if (response.data.public_reply_texts) updatedSettings.publicReplyTexts = response.data.public_reply_texts;
          if (response.data.public_reply_flow_id) updatedSettings.publicReplyFlowId = response.data.public_reply_flow_id;
          if (response.data.equal_comments) updatedSettings.equalComments = response.data.equal_comments;
          if (response.data.contain_comments) updatedSettings.containComments = response.data.contain_comments;
          if (response.data.specific_post_id) updatedSettings.specificPostId = response.data.specific_post_id;
          
          const updateResponse = await api.updateSettings(updatedSettings);
          
          if (updateResponse.success) {
            setToolStatuses(prev => ({
              ...prev,
              [toolId]: {
                ...prev[toolId] || { isConfigured: true },
                isActive: !currentStatus,
              },
            }));
            toast({
              title: "Success",
              description: `${toolId === 'facebook' ? 'Facebook' : 'Instagram'} automation ${!currentStatus ? 'activated' : 'deactivated'}`,
            });
          } else {
            throw new Error(updateResponse.message || 'Update failed');
          }
        } else {
          toast({
            title: "Error",
            description: "Settings not found. Please configure the automation first.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update automation status",
          variant: "destructive",
        });
      }
    } else {
      setToolStatuses(prev => ({
        ...prev,
        [toolId]: {
          ...prev[toolId] || { isConfigured: false },
          isActive: !currentStatus,
        },
      }));
    }
  };

  const handleView = (toolId: string) => {
    if (toolId === 'facebook' || toolId === 'instagram') {
      setSelectedPlatform(toolId as 'facebook' | 'instagram');
      setShowSettings(true);
    } else {
      setCurrentTool(toolId);
      setShowToolContent(true);
    }
  };

  const handleLogs = (toolId: string) => {
    if (toolId === 'facebook' || toolId === 'instagram') {
      setSelectedPlatform(toolId as 'facebook' | 'instagram');
      setViewMode('logs');
    }
  };

  const handleBackToTools = () => {
    setShowToolContent(false);
    setShowSettings(false);
    setShowLogs(false);
    setCurrentTool(null);
    setSelectedPlatform(null);
    setViewMode('tools');
    setDripCampaignView('list');
    setEditingCampaign(null);
    loadToolStatuses();
  };

  const handleCreateCampaign = (title: string) => {
    setCampaignTitle(title);
    setDripCampaignView('create');
    setEditingCampaign(null);
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setDripCampaignView('edit');
  };

  const handleBackToList = () => {
    setDripCampaignView('list');
    setEditingCampaign(null);
    setCampaignTitle('');
  };

  if (viewMode === 'logs' && selectedPlatform) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <CommentLogs 
            platform={selectedPlatform} 
            onBack={handleBackToTools} 
          />
        </div>
      </div>
    );
  }

  if (showSettings && selectedPlatform) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {selectedPlatform === 'facebook' && (
            <CommentManager onBack={handleBackToTools} />
          )}
          {selectedPlatform === 'instagram' && (
            <InstagramCommentManager onBack={handleBackToTools} />
          )}
        </div>
      </div>
    );
  }

  if (showToolContent) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentTool === 'facebook' && (
            <CommentManager onBack={handleBackToTools} />
          )}
          {currentTool === 'instagram' && (
            <InstagramCommentManager onBack={handleBackToTools} />
          )}
          {currentTool === 'drip_campaigns' && (
            <>
              {dripCampaignView === 'list' && (
                <AllDripCampaign 
                  onCreateCampaign={handleCreateCampaign}
                  onEditCampaign={handleEditCampaign}
                  onBack={handleBackToTools}
                />
              )}
              {(dripCampaignView === 'create' || dripCampaignView === 'edit') && (
                <DripCampaign 
                  onBack={handleBackToList}
                  editingCampaign={editingCampaign}
                  campaignTitle={campaignTitle}
                />
              )}
            </>
          )}
          {currentTool === 'qr_generator' && (
            <QRGenerator onBack={handleBackToTools} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Automation Tools</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automationTools.map((tool) => {
            const status = toolStatuses[tool.id] || { isActive: false, isConfigured: false };
            const IconComponent = tool.icon;

            return (
              <Card
                key={tool.id}
                className={`${tool.borderColor} border-2 hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`${tool.iconColor} p-3 rounded-lg text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Active</span>
                      <Switch
                        checked={status.isActive}
                        onCheckedChange={() => handleToggle(tool.id, status.isActive)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    {status.isConfigured && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Configured
                      </Badge>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {(tool.id === 'facebook' || tool.id === 'instagram') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLogs(tool.id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Logs
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(tool.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
