import React, { useState } from 'react';
import { useFlows } from '@/hooks/useFlows';
import { facebookCommentAPI, CommentAutomationSettings } from '@/utils/api/comment-automation/comment-automation-api';

interface RadioOption {
  id: string;
  label: string;
  checked: boolean;
}

interface CommentSettingsUIProps {
  onBack?: () => void;
}

const CommentSettingsUI: React.FC<CommentSettingsUIProps> = ({ onBack }) => {
  const { flows, loading: flowsLoading } = useFlows();
  const [trackComments, setTrackComments] = useState<'all' | 'specific'>('all');
  const [isSaving, setIsSaving] = useState(false);
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

  // Handle cancel functionality
  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-full bg-white font-sans p-6 pb-8">
      {/* Header with Back button and Save/Cancel buttons */}
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
      
      {/* Track comments section */}
      {/* <div className="mb-10 px-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Track comments on</h3>
        <div className="flex items-center space-x-6 mb-4">
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
            <span className="ml-2 text-gray-700">Specific post</span>
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
      </div> */}

      {/* Private reply section */}
      <div className="mb-10 px-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Private reply to comment</h3>
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
                  {flow.name}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Public reply section */}
      <div className="mb-10 px-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Public reply to comment</h3>
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
              Add New
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
                  {flow.name}
                </option>
              ))}
            </select>
          </div>
        )}

        
      </div>

      {/* Reply to section */}
      <div className="mb-10 px-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to</h3>
        <div className="flex items-center space-x-8 mb-4">
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
          {/* Hidden radio buttons for future use */}
          {/* <label className="flex items-center">
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
          </label> */}
        </div>

                {/* Comments equal to tags */}
        {/* {replyTo === 'equal' && (
          <div className="ml-6">
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
        )} */}

        {/* Comments that contain tags */}
        {/* {replyTo === 'contain' && (
          <div className="ml-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CommentSettingsUI;