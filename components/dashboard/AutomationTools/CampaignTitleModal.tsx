import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CampaignTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  loading?: boolean;
}

const CampaignTitleModal: React.FC<CampaignTitleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    if (title.trim()) {
      try {
        await onSave(title.trim());
        toast({
          title: "Success!",
          description: "Campaign created successfully!",
          variant: "success",
        });
        setTitle('');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create campaign. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Campaign</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter campaign title"
            className="w-full"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignTitleModal;
