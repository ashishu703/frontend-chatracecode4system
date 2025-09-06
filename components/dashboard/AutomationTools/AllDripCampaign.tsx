import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, MoreVertical } from 'lucide-react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { API_ENDPOINTS } from '@/utils/api/enpointsUtils/Api-endpoints';
import CampaignTitleModal from './CampaignTitleModal';

// Utility functions (DRY principle)
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
}


const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await serverHandler.get(API_ENDPOINTS.DripCampaign.GET_CAMPAIGNS);
    return response?.data?.success ? response.data.data : [];
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    return [];
  }
};

const updateCampaignStatus = async (campaignId: string, status: string): Promise<boolean> => {
  try {
    const endpoint = buildEndpoint(API_ENDPOINTS.DripCampaign.UPDATE_CAMPAIGN_STATUS, { campaign_id: campaignId });
    const response = await serverHandler.put(endpoint, { status });
    return response?.data?.success || false;
  } catch (err) {
    console.error('Failed to update campaign status:', err);
    return false;
  }
};

const deleteCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    const endpoint = buildEndpoint(API_ENDPOINTS.DripCampaign.DELETE_CAMPAIGN, { campaign_id: campaignId });
    const response = await serverHandler.delete(endpoint);
    return response?.data?.success || false;
  } catch (err) {
    console.error('Failed to delete campaign:', err);
    return false;
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
    {status}
  </span>
);


const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, loading, onEdit, onDelete, onStatusChange }) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const selectAllCampaigns = () => {
    setSelectedCampaigns(
      selectedCampaigns.length === campaigns.length 
        ? [] 
        : campaigns.map(c => c.campaign_id)
    );
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
      const success = await deleteCampaign(campaignId);
      if (success) {
        onDelete(campaignId);
      }
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
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                  onCheckedChange={selectAllCampaigns}
                />
              </th>
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
                  <Checkbox
                    checked={selectedCampaigns.includes(campaign.campaign_id)}
                    onCheckedChange={() => toggleCampaignSelection(campaign.campaign_id)}
                  />
                </td>
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
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenDropdown(openDropdown === campaign.campaign_id ? null : campaign.campaign_id)}
                      className="p-1 h-6 w-6"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    {openDropdown === campaign.campaign_id && (
                      <div className="dropdown-menu absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEdit(campaign);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          
                          <button
                            onClick={() => {
                              handleStatusChange(campaign.campaign_id, campaign.status);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                          >
                            {campaign.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          
                          <button
                            onClick={() => {
                              handleDelete(campaign.campaign_id);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

  const loadCampaigns = async () => {
    setLoading(true);
    const fetchedCampaigns = await fetchCampaigns();
    setCampaigns(fetchedCampaigns);
    setLoading(false);
  };

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.campaign_id === campaignId 
        ? { ...campaign, status: newStatus }
        : campaign
    ));
  };

  const handleDelete = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.campaign_id !== campaignId));
  };

  const handleCreateCampaign = () => {
    setShowTitleModal(true);
  };

  const handleSaveCampaignTitle = async (title: string) => {
    setCreatingCampaign(true);
    try {
      await onCreateCampaign(title);
      setShowTitleModal(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error; // Re-throw to let the modal handle the toast
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu')) {
        // Handle dropdown close logic here if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-full bg-white font-sans p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Drip campaigns</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
