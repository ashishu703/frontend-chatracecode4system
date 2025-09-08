import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical } from 'lucide-react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { API_ENDPOINTS } from '@/utils/api/enpointsUtils/Api-endpoints';
import CampaignTitleModal from './CampaignTitleModal';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const getStatusBadgeClass = (status: string): string => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
};

const buildEndpoint = (endpoint: string, params: Record<string, string>): string => {
  return API_ENDPOINTS.Helpers.buildEndpoint(endpoint, params);
};


interface Campaign {
  id: number;
  campaign_id: string;
  title: string;
  status: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  loading: boolean;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onStatusChange: (campaignId: string, status: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}


const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await serverHandler.get(API_ENDPOINTS.DripCampaign.GET_CAMPAIGNS);
    return response?.data?.success ? response.data.data : [];
  } catch (err) {
    return [];
  }
};

const updateCampaignStatus = async (campaignId: string, status: string): Promise<boolean> => {
  try {
    const endpoint = buildEndpoint(API_ENDPOINTS.DripCampaign.UPDATE_CAMPAIGN_STATUS, { campaign_id: campaignId });
    const response = await serverHandler.put(endpoint, { status });
    return response?.data?.success || false;
  } catch (err) {
    return false;
  }
};

const deleteCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    const endpoint = buildEndpoint(API_ENDPOINTS.DripCampaign.DELETE_CAMPAIGN, { campaign_id: campaignId });
    console.log('Delete endpoint:', endpoint);
    const response = await serverHandler.delete(endpoint);
    console.log('Delete response:', response);
    return response?.data?.success || false;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
    {status}
  </span>
);


const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, loading, onEdit, onDelete, onStatusChange, searchTerm, onSearchChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getDropdownActions = () => {
    const campaign = campaigns.find(c => c.campaign_id === openDropdown);
    if (!campaign) return [];

    return [
      {
        label: 'Edit',
        onClick: () => onEdit(campaign),
        className: 'text-blue-600 hover:bg-blue-50'
      },
      {
        label: campaign.status === 'active' ? 'Pause' : 'Resume',
        onClick: () => onStatusChange(campaign.campaign_id, campaign.status),
        className: 'text-yellow-600 hover:bg-yellow-50'
      },
      {
        label: 'Delete',
        onClick: () => onDelete(campaign.campaign_id),
        className: 'text-red-600 hover:bg-red-50'
      }
    ];
  };

  const handleStatusChange = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const success = await updateCampaignStatus(campaignId, newStatus);
    if (success) {
      onStatusChange(campaignId, newStatus);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await onDelete(campaignId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Campaigns</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{campaign.messages?.length || 0}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenDropdown(openDropdown === campaign.campaign_id ? null : campaign.campaign_id)}
                    className="p-1 h-6 w-6"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu */}
      {openDropdown && (
        <div className="fixed inset-0 z-[9999]" onClick={() => setOpenDropdown(null)}>
          <div className="absolute bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px] top-48 right-12">
            <div className="py-1">
              {getDropdownActions().map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    setOpenDropdown(null);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm ${action.className}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No campaigns found</div>
        </div>
      )}
    </div>
  );
};

interface AllDripCampaignProps {
  onCreateCampaign: (title: string) => void;
  onEditCampaign: (campaign: Campaign) => void;
  onBack?: () => void;
}

const AllDripCampaign: React.FC<AllDripCampaignProps> = ({ onCreateCampaign, onEditCampaign, onBack }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const { toast } = useToast();

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const fetchedCampaigns = await fetchCampaigns();
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.campaign_id === campaignId 
        ? { ...campaign, status: newStatus }
        : campaign
    ));
  };

  const handleDelete = async (campaignId: string) => {
    try {
      const success = await deleteCampaign(campaignId);
      if (success) {
        setCampaigns(prev => prev.filter(campaign => campaign.campaign_id !== campaignId));
        toast({
          title: "Success!",
          description: "Campaign deleted successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleCreateCampaign = () => {
    setShowTitleModal(true);
  };

  const handleSaveCampaignTitle = async (title: string) => {
    setCreatingCampaign(true);
    try {
      await onCreateCampaign(title);
      setShowTitleModal(false);
      toast({
        title: "Success!",
        description: "Campaign created successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
      throw error;
    } finally {
      setCreatingCampaign(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadCampaigns();
  }, []);


  return (
    <div className="w-full max-w-full bg-white font-sans p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Drip campaigns</h2>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              ← Back
            </Button>
            <Button
              onClick={handleCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

      </div>

      <CampaignTable
        campaigns={filteredCampaigns}
        loading={loading}
        onEdit={onEditCampaign}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <CampaignTitleModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        onSave={handleSaveCampaignTitle}
        loading={creatingCampaign}
      />
    </div>
  );
};

export default AllDripCampaign;
