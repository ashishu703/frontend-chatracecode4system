import React, { useState } from 'react';
import { useFlows } from '@/hooks/useFlows';
import { facebookCommentAPI, CommentAutomationSettings } from '@/utils/api/comment-automation/comment-automation-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentSettingsUIProps {
  onBack?: () => void;
}

const CommentSettingsUI: React.FC<CommentSettingsUIProps> = ({ onBack }) => {
  const { flows, loading: flowsLoading } = useFlows();
  const { toast } = useToast();
  const [trackComments, setTrackComments] = useState<'all' | 'specific'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Helper functions for managing tags
  const addEqualComment = () => {
    if (equalCommentInput.trim()) {
      setEqualComments([...equalComments, equalCommentInput.trim()]);
      setEqualCommentInput('');
    }
  };

  const removeEqualComment = (index: number) => {
    setEqualComments(equalComments.filter((_, i) => i !== index));
  };

  const addContainComment = () => {
    if (containCommentInput.trim()) {
      setContainComments([...containComments, containCommentInput.trim()]);
      setContainCommentInput('');
    }
  };

  const removeContainComment = (index: number) => {
    setContainComments(containComments.filter((_, i) => i !== index));
  };

  // Helper functions for managing multiple public reply texts
  const addPublicReplyText = () => {
    setPublicReplyTexts([...publicReplyTexts, '']);
  };

  const removePublicReplyText = (index: number) => {
    if (publicReplyTexts.length > 1) {
      setPublicReplyTexts(publicReplyTexts.filter((_, i) => i !== index));
    }
  };

  const updatePublicReplyText = (index: number, value: string) => {
    const newTexts = [...publicReplyTexts];
    newTexts[index] = value;
    setPublicReplyTexts(newTexts);
  };

  const [specificPostId, setSpecificPostId] = useState('');
  const [privateReplyType, setPrivateReplyType] = useState<'text' | 'flow' | 'none'>('flow');
  const [privateReplyText, setPrivateReplyText] = useState('');
  const [privateReplyFlow, setPrivateReplyFlow] = useState('');
  const [publicReplyType, setPublicReplyType] = useState<'text' | 'flow' | 'none'>('text');
  const [publicReplyText, setPublicReplyText] = useState('Thank you !!');
  const [publicReplyFlow, setPublicReplyFlow] = useState('');
  const [publicReplyTexts, setPublicReplyTexts] = useState<string[]>(['Thank you !!']);
  const [replyTo, setReplyTo] = useState<'all' | 'equal' | 'contain'>('all');
  const [equalComments, setEqualComments] = useState<string[]>([]);
  const [containComments, setContainComments] = useState<string[]>([]);
  const [equalCommentInput, setEqualCommentInput] = useState('');
  const [containCommentInput, setContainCommentInput] = useState('');

  // Handle save functionality
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Prepare settings payload
      const settings: Omit<CommentAutomationSettings, 'platform'> = {
        // Private reply settings
        privateReplyType,
        privateReplyText: privateReplyType === 'text' ? privateReplyText : undefined,
        privateReplyFlowId: privateReplyType === 'flow' ? privateReplyFlow : undefined,
        
        // Public reply settings
        publicReplyType,
        publicReplyTexts: publicReplyType === 'text' ? publicReplyTexts.filter(text => text.trim()) : undefined,
        publicReplyFlowId: publicReplyType === 'flow' ? publicReplyFlow : undefined,
        
        // Reply target settings
        replyTo,
        equalComments: replyTo === 'equal' ? equalComments : undefined,
        containComments: replyTo === 'contain' ? containComments : undefined,
        
        // Post tracking settings
        trackComments,
        specificPostId: trackComments === 'specific' ? specificPostId : undefined,
        
        // Additional settings
        isActive: true
      };

      const response = await facebookCommentAPI.saveSettings(settings);

      if (response.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: response.message || 'Failed to save settings' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred while saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete these settings? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await facebookCommentAPI.deleteSettings();
      if (response.success) {
        toast({
          title: "Success",
          description: "Settings deleted successfully",
        });
        if (onBack) {
          onBack();
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting settings",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-full bg-gray-50 font-sans p-6 pb-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {onBack && (
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center">Facebook Comment Settings</h1>
          <div className="flex space-x-3">
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Track Comments</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">Choose which posts to monitor for comments.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="trackComments"
                  value="all"
                  checked={trackComments === 'all'}
                  onChange={(e) => setTrackComments(e.target.value as 'all' | 'specific')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-blue-600 font-medium">All Posts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="trackComments"
                  value="specific"
                  checked={trackComments === 'specific'}
                  onChange={(e) => setTrackComments(e.target.value as 'all' | 'specific')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Specific Post</span>
              </label>
            </div>
            {trackComments === 'specific' && (
              <div className="mt-4">
                <select
                  value={specificPostId}
                  onChange={(e) => setSpecificPostId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a post</option>
                  <option value="post1">Post 1 - Welcome to our page!</option>
                  <option value="post2">Post 2 - New product launch</option>
                  <option value="post3">Post 3 - Weekly update</option>
                  <option value="post4">Post 4 - Customer testimonial</option>
                  <option value="post5">Post 5 - Behind the scenes</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <CardTitle>Private Reply</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">Send a private message to the commenter.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privateReply"
                  value="text"
                  checked={privateReplyType === 'text'}
                  onChange={(e) => setPrivateReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Text</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privateReply"
                  value="flow"
                  checked={privateReplyType === 'flow'}
                  onChange={(e) => setPrivateReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-blue-600 font-medium">Flow</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privateReply"
                  value="none"
                  checked={privateReplyType === 'none'}
                  onChange={(e) => setPrivateReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">None</span>
              </label>
            </div>
            {privateReplyType === 'text' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={privateReplyText}
                  onChange={(e) => setPrivateReplyText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter private reply text"
                />
              </div>
            )}
            {privateReplyType === 'flow' && (
              <div className="mt-4">
                <select
                  value={privateReplyFlow}
                  onChange={(e) => setPrivateReplyFlow(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={flowsLoading}
                >
                  <option value="">{flowsLoading ? 'Loading flows...' : 'Select a flow'}</option>
                  {flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-blue-600" />
              <CardTitle>Public Reply</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">Reply publicly to comments on your posts.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="publicReply"
                  value="text"
                  checked={publicReplyType === 'text'}
                  onChange={(e) => setPublicReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-blue-600 font-medium">Text</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="publicReply"
                  value="flow"
                  checked={publicReplyType === 'flow'}
                  onChange={(e) => setPublicReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Flow</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="publicReply"
                  value="none"
                  checked={publicReplyType === 'none'}
                  onChange={(e) => setPublicReplyType(e.target.value as 'text' | 'flow' | 'none')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">None</span>
              </label>
            </div>
            
            {publicReplyType === 'text' && (
              <div className="space-y-3">
                {publicReplyTexts.map((text, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => updatePublicReplyText(index, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a message..."
                    />
                    {publicReplyTexts.length > 1 && (
                      <button
                        onClick={() => removePublicReplyText(index)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPublicReplyText}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
                >
                  + Add New Message
                </button>
              </div>
            )}
            {publicReplyType === 'flow' && (
              <div className="mt-4">
                <select
                  value={publicReplyFlow}
                  onChange={(e) => setPublicReplyFlow(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={flowsLoading}
                >
                  <option value="">{flowsLoading ? 'Loading flows...' : 'Select a flow'}</option>
                  {flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-blue-600" />
              <CardTitle>Reply To</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">Choose which comments to respond to.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="replyTo"
                  value="all"
                  checked={replyTo === 'all'}
                  onChange={(e) => setReplyTo(e.target.value as 'all' | 'equal' | 'contain')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-blue-600 font-medium">All comments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="replyTo"
                  value="equal"
                  checked={replyTo === 'equal'}
                  onChange={(e) => setReplyTo(e.target.value as 'all' | 'equal' | 'contain')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Comments equal to</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="replyTo"
                  value="contain"
                  checked={replyTo === 'contain'}
                  onChange={(e) => setReplyTo(e.target.value as 'all' | 'equal' | 'contain')}
                  className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Comments that contain</span>
              </label>
            </div>

            {replyTo === 'equal' && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {equalComments.map((comment, index) => (
                    <div key={index} className="flex items-center bg-gray-100 border border-gray-200 rounded px-3 py-1 text-gray-700">
                      <span>{comment}</span>
                      <button
                        onClick={() => removeEqualComment(index)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addEqualComment}
                    className="flex items-center bg-gray-100 border border-gray-200 rounded px-3 py-1 text-gray-700 hover:bg-gray-200"
                  >
                    <span className="mr-1">+</span>
                    Add
                  </button>
                </div>
                <input
                  type="text"
                  value={equalCommentInput}
                  onChange={(e) => setEqualCommentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEqualComment()}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter comment text"
                />
              </div>
            )}

            {replyTo === 'contain' && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {containComments.map((comment, index) => (
                    <div key={index} className="flex items-center bg-gray-100 border border-gray-200 rounded px-3 py-1 text-gray-700">
                      <span>{comment}</span>
                      <button
                        onClick={() => removeContainComment(index)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addContainComment}
                    className="flex items-center bg-gray-100 border border-gray-200 rounded px-3 py-1 text-gray-700 hover:bg-gray-200"
                  >
                    <span className="mr-1">+</span>
                    Add
                  </button>
                </div>
                <input
                  type="text"
                  value={containCommentInput}
                  onChange={(e) => setContainCommentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addContainComment()}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter comment text"
                />
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentSettingsUI;