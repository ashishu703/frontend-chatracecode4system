import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, MoreVertical } from 'lucide-react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { API_ENDPOINTS } from '@/utils/api/enpointsUtils/Api-endpoints';

const DEFAULT_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseSelectedDays = (selectedDays?: string[]): string[] => {
  return selectedDays && selectedDays.length > 0 ? selectedDays : DEFAULT_DAYS;
};

const buildCampaignData = (formState: any, messageRows: any[]) => ({
  title: formState.campaignTitle,
  messages: messageRows.map(row => ({
    flow_id: row.flow_id,
    flow_title: row.flow_title,
    delay_value: row.delayValue,
    time_unit: row.timeUnit,
    time_interval_enabled: row.time_interval_enabled,
    start_time: row.start_time,
    end_time: row.end_time,
    selected_days: parseSelectedDays(row.selected_days)
  })),
  time_interval_enabled: formState.sendTimeIntervalEnabled,
  start_time: formState.startTime,
  end_time: formState.endTime,
  selected_days: parseSelectedDays(formState.selectedDays)
});

const validateCampaign = (campaignTitle: string, messageRows: any[]): string | null => {
  if (!campaignTitle.trim()) return 'Campaign title is required';
  if (messageRows.length === 0) return 'At least one message is required';
  
  const invalidMessages = messageRows.filter(row => !row.messageContent || !row.flow_id);
  if (invalidMessages.length > 0) return 'All messages must have a flow selected';
  
  return null;
};

interface MessageRow {
  id: string;
  messageContent: string;
  delayValue: number;
  timeUnit: 'immediately' | 'minutes' | 'hours' | 'days';
  flow_id?: number;
  flow_title?: string;
  time_interval_enabled?: boolean;
  start_time?: string;
  end_time?: string;
  selected_days?: string[];
}

interface Flow {
  id: number;
  uid: string;
  flow_id: string;
  title: string;
  prevent_list: any;
  ai_list: any;
  createdAt: string;
  updatedAt: string;
}

interface DripCampaignProps {
  onBack?: () => void;
  editingCampaign?: Campaign | null;
  campaignTitle?: string;
}

interface Campaign {
  id: number;
  campaign_id: string;
  title: string;
  status: string;
  time_interval_enabled: boolean;
  start_time: string;
  end_time: string;
  selected_days: string[];
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

const useCampaignForm = () => {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [sendTimeIntervalEnabled, setSendTimeIntervalEnabled] = useState(true);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(DEFAULT_DAYS);
  const [messageRows, setMessageRows] = useState<MessageRow[]>([]);

  const resetForm = () => {
    setCampaignTitle('');
    setMessageRows([]);
    setSelectedDays(DEFAULT_DAYS);
    setStartTime('00:00');
    setEndTime('23:00');
    setSendTimeIntervalEnabled(true);
  };

  return {
    campaignTitle, setCampaignTitle,
    sendTimeIntervalEnabled, setSendTimeIntervalEnabled,
    startTime, setStartTime,
    endTime, setEndTime,
    selectedDays, setSelectedDays,
    messageRows, setMessageRows,
    resetForm
  };
};

const useCampaignData = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const response = await serverHandler.get('/api/chat_flow/get_mine?page=1&size=10&search=&sort=createdAt&order=desc');
      setFlows(response?.data?.success ? response.data.data : []);
    } catch (err) {
      console.error('Failed to fetch flows');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await serverHandler.get(API_ENDPOINTS.DripCampaign.GET_CAMPAIGNS);
      setCampaigns(response?.data?.success ? response.data.data : []);
    } catch (err) {
      console.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  return { flows, campaigns, loading, fetchFlows, fetchCampaigns };
};

const useUIState = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return {
    saving, setSaving,
    error, setError,
    success, setSuccess,
    showCampaigns, setShowCampaigns,
    editingCampaign, setEditingCampaign,
    openDropdown, setOpenDropdown
  };
};

const DripCampaign: React.FC<DripCampaignProps> = ({ onBack, editingCampaign, campaignTitle }) => {
  const formState = useCampaignForm();
  const dataState = useCampaignData();
  const uiState = useUIState();

  const timeUnits = [
    { value: 'immediately', label: 'Immediately' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' }
  ];

  const daysOfWeek = DEFAULT_DAYS;

  const createCampaign = async () => {
    const validationError = validateCampaign(formState.campaignTitle, formState.messageRows);
    if (validationError) {
      uiState.setError(validationError);
      return;
    }

    uiState.setSaving(true);
    uiState.setError(null);
    uiState.setSuccess(null);

    try {
      const campaignData = buildCampaignData(formState, formState.messageRows);
      const response = await serverHandler.post(API_ENDPOINTS.DripCampaign.CREATE_CAMPAIGN, campaignData);
      
      if (response?.data?.success) {
        uiState.setSuccess('Campaign created successfully!');
        formState.resetForm();
        dataState.fetchCampaigns();
      } else {
        uiState.setError('Failed to create campaign');
      }
    } catch (err) {
      uiState.setError('Failed to create campaign');
    } finally {
      uiState.setSaving(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const endpoint = API_ENDPOINTS.Helpers.buildEndpoint(API_ENDPOINTS.DripCampaign.UPDATE_CAMPAIGN_STATUS, { campaign_id: campaignId });
      const response = await serverHandler.put(endpoint, { status });
      if (response?.data?.success) {
        uiState.setSuccess(`Campaign ${status} successfully`);
        dataState.fetchCampaigns();
      } else {
        uiState.setError('Failed to update campaign status');
      }
    } catch (err) {
      uiState.setError('Failed to update campaign status');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const endpoint = API_ENDPOINTS.Helpers.buildEndpoint(API_ENDPOINTS.DripCampaign.DELETE_CAMPAIGN, { campaign_id: campaignId });
      const response = await serverHandler.delete(endpoint);
      if (response?.data?.success) {
        uiState.setSuccess('Campaign deleted successfully');
        dataState.fetchCampaigns();
      } else {
        uiState.setError('Failed to delete campaign');
      }
    } catch (err) {
      uiState.setError('Failed to delete campaign');
    }
  };

  const editCampaign = (campaign: Campaign) => {
    uiState.setEditingCampaign(campaign);
    formState.setCampaignTitle(campaign.title);
    formState.setSendTimeIntervalEnabled(campaign.time_interval_enabled);
    formState.setStartTime(campaign.start_time);
    formState.setEndTime(campaign.end_time);
    formState.setSelectedDays(parseSelectedDays(campaign.selected_days));
    
    const campaignMessages = campaign.messages?.map((msg: any) => ({
      id: Date.now().toString() + Math.random(),
      messageContent: msg.flow_title,
      delayValue: msg.delay_value,
      timeUnit: msg.time_unit,
      flow_id: msg.flow_id,
      flow_title: msg.flow_title,
      time_interval_enabled: msg.time_interval_enabled || true,
      start_time: msg.start_time || '00:00',
      end_time: msg.end_time || '23:00',
      selected_days: parseSelectedDays(msg.selected_days)
    })) || [];
    
    formState.setMessageRows(campaignMessages);
    uiState.setShowCampaigns(false);
  };

  const updateCampaign = async () => {
    if (!uiState.editingCampaign) return;

    const validationError = validateCampaign(formState.campaignTitle, formState.messageRows);
    if (validationError) {
      uiState.setError(validationError);
      return;
    }

    uiState.setSaving(true);
    uiState.setError(null);
    uiState.setSuccess(null);

    try {
      const campaignData = buildCampaignData(formState, formState.messageRows);
      const endpoint = API_ENDPOINTS.Helpers.buildEndpoint(API_ENDPOINTS.DripCampaign.UPDATE_CAMPAIGN, { campaign_id: uiState.editingCampaign.campaign_id });
      const response = await serverHandler.put(endpoint, campaignData);
      
      if (response?.data?.success) {
        uiState.setSuccess('Campaign updated successfully!');
        uiState.setEditingCampaign(null);
        formState.resetForm();
        dataState.fetchCampaigns();
      } else {
        uiState.setError('Failed to update campaign');
      }
    } catch (err) {
      uiState.setError('Failed to update campaign');
    } finally {
      uiState.setSaving(false);
    }
  };

  const cancelEdit = () => {
    uiState.setEditingCampaign(null);
    formState.resetForm();
  };

  const updateMessageRow = (id: string, field: keyof MessageRow, value: any) => {
    formState.setMessageRows(prev => prev.map(row => {
      if (row.id === id) {
        if (field === 'messageContent') {
          const selectedFlow = dataState.flows.find(flow => flow.title === value);
          return { 
            ...row, 
            [field]: value,
            flow_id: selectedFlow?.id,
            flow_title: selectedFlow?.title
          };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const addMessageRow = () => {
    const newRow: MessageRow = {
      id: Date.now().toString(),
      messageContent: '',
      delayValue: 1,
      timeUnit: 'hours',
      time_interval_enabled: true,
      start_time: '00:00',
      end_time: '23:00',
      selected_days: DEFAULT_DAYS
    };
    formState.setMessageRows(prev => [...prev, newRow]);
  };

  const removeMessageRow = (id: string) => {
    formState.setMessageRows(prev => prev.filter(row => row.id !== id));
  };

  const toggleDay = (day: string) => {
    formState.setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const getFlowOptions = () => {
    if (dataState.loading) return <SelectItem value="loading" disabled>Loading flows...</SelectItem>;
    if (uiState.error) return <SelectItem value="error" disabled>Error loading flows</SelectItem>;
    if (dataState.flows.length === 0) return <SelectItem value="no-flows" disabled>No flows available</SelectItem>;
    return dataState.flows.map((flow) => (
      <SelectItem key={flow.id} value={flow.title}>
        {flow.title}
      </SelectItem>
    ));
  };

  const getDayButtonClass = (day: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm border transition-colors";
    const isSelected = formState.selectedDays.includes(day);
    return isSelected 
      ? `${baseClass} bg-blue-100 text-blue-700 border-blue-200`
      : `${baseClass} bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200`;
  };

  useEffect(() => {
    dataState.fetchFlows();
    dataState.fetchCampaigns();
  }, []);

  useEffect(() => {
    if (editingCampaign) {
      editCampaign(editingCampaign);
    }
  }, [editingCampaign]);

  useEffect(() => {
    if (campaignTitle) {
      formState.setCampaignTitle(campaignTitle);
    }
  }, [campaignTitle]);

  useEffect(() => {
    if (uiState.success || uiState.error) {
      const timer = setTimeout(() => {
        uiState.setSuccess(null);
        uiState.setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uiState.success, uiState.error]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (uiState.openDropdown && !target.closest('.dropdown-menu')) {
        uiState.setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [uiState.openDropdown]);

  return (
    <div className="w-full max-w-full bg-white font-sans p-6 pb-8">
      {/* Header with Toggle */}
      <div className="mb-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {uiState.editingCampaign ? `Edit Campaign: ${uiState.editingCampaign.title}` : 'Drip Campaign'}
          </h2>
          <div className="flex space-x-2">
            {uiState.editingCampaign ? (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel Edit
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={updateCampaign}
                  disabled={uiState.saving}
                >
                  {uiState.saving ? 'Updating...' : 'Update Campaign'}
                </Button>
              </>
            ) : (
              <>
                {onBack && (
                  <Button variant="outline" onClick={onBack}>
                    Back
                  </Button>
                )}
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={createCampaign}
                  disabled={uiState.saving}
                >
                  {uiState.saving ? 'Saving...' : 'Save Campaign'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {uiState.success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {uiState.success}
          </div>
        )}
        {uiState.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {uiState.error}
          </div>
        )}
      </div>

      {!uiState.showCampaigns ? (
        <>
          {/* Message Rows */}
          <div className="mb-10 px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Message Scheduling</h3>
            <div className="space-y-4">
              {formState.messageRows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages added yet. Click "Add Message" to get started.
                </div>
              ) : (
                formState.messageRows.map((row) => (
                  <div key={row.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    {/* Message Selection and Delay */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Send</span>
                        <Select
                          value={row.messageContent}
                          onValueChange={(value) => updateMessageRow(row.id, 'messageContent', value)}
                        >
                          <SelectTrigger className="w-[400px]">
                            <SelectValue placeholder={dataState.loading ? "Loading flows..." : "Select a flow"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getFlowOptions()}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">After</span>
                        <Input
                          type="number"
                          value={row.delayValue}
                          onChange={(e) => updateMessageRow(row.id, 'delayValue', parseInt(e.target.value) || 0)}
                          className="w-16"
                          min="0"
                        />
                        <Select
                          value={row.timeUnit}
                          onValueChange={(value) => updateMessageRow(row.id, 'timeUnit', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMessageRow(row.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Per-Message Time Interval Settings */}
                    <div className="ml-6 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`time-interval-${row.id}`}
                          checked={row.time_interval_enabled || false}
                          onCheckedChange={(checked) => updateMessageRow(row.id, 'time_interval_enabled', checked)}
                        />
                        <label htmlFor={`time-interval-${row.id}`} className="text-sm font-medium text-gray-700">
                          Set send time interval
                        </label>
                      </div>

                      {row.time_interval_enabled && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center space-x-3">
                            <Input
                              type="time"
                              value={row.start_time || '00:00'}
                              onChange={(e) => updateMessageRow(row.id, 'start_time', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                              type="time"
                              value={row.end_time || '23:00'}
                              onChange={(e) => updateMessageRow(row.id, 'end_time', e.target.value)}
                              className="w-32"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day) => (
                              <button
                                key={day}
                                onClick={() => {
                                  const currentDays = row.selected_days || [];
                                  const newDays = currentDays.includes(day) 
                                    ? currentDays.filter(d => d !== day)
                                    : [...currentDays, day];
                                  updateMessageRow(row.id, 'selected_days', newDays);
                                }}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                  (row.selected_days || []).includes(day)
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* Add Message Button */}
          <div className="mb-10 px-6">
            <Button
              variant="outline"
              onClick={addMessageRow}
              className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>

        </>
      ) : (
        /* Campaigns List View */
        <div className="px-6">
          {dataState.loading ? (
            <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
          ) : dataState.campaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No campaigns found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataState.campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header with title and three-dot menu */}
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {campaign.title}
                      </h4>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => uiState.setOpenDropdown(uiState.openDropdown === campaign.campaign_id ? null : campaign.campaign_id)}
                          className="p-1 h-6 w-6"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                        
                        {uiState.openDropdown === campaign.campaign_id && (
                          <div className="dropdown-menu absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  editCampaign(campaign);
                                  uiState.setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </button>
                              
                              {campaign.status === 'active' && (
                                <button
                                  onClick={() => {
                                    updateCampaignStatus(campaign.campaign_id, 'paused');
                                    uiState.setOpenDropdown(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                >
                                  Pause
                                </button>
                              )}
                              
                              {campaign.status === 'paused' && (
                                <button
                                  onClick={() => {
                                    updateCampaignStatus(campaign.campaign_id, 'active');
                                    uiState.setOpenDropdown(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  Resume
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  updateCampaignStatus(campaign.campaign_id, 'cancelled');
                                  uiState.setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
                              >
                                Cancel
                              </button>
                              
                              <button
                                onClick={() => {
                                  deleteCampaign(campaign.campaign_id);
                                  uiState.setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    {/* Campaign Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Messages:</span>
                        <span className="font-medium">{campaign.messages?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Created:</span>
                        <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DripCampaign;