"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { useToast } from "@/hooks/use-toast";

interface CommentLog {
  id: string;
  comment_id: string;
  post_id: string;
  user_name: string;
  message: string;
  created_time: string;
  status: string;
  reply_sent?: boolean;
  reply_type?: 'private' | 'public';
  error?: string;
}

interface CommentLogsProps {
  platform: 'facebook' | 'instagram';
  onBack?: () => void;
  onClose?: () => void;
}

const CommentLogs = ({ platform, onBack, onClose }: CommentLogsProps) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<CommentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 10 seconds for live logs
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [platform]);

  const fetchLogs = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const endpoint = platform === 'facebook' 
        ? '/api/user/facebook/comments' 
        : '/api/user/instagram/comments';
      
      const response = await serverHandler.get(endpoint);
      
      if (response.data?.success) {
        const comments = response.data.data || response.data || [];
        const formattedLogs = Array.isArray(comments) ? comments.map((comment: any) => ({
          id: comment.comment_id || comment.id || Math.random().toString(),
          comment_id: comment.comment_id || comment.id,
          post_id: comment.post_id || 'N/A',
          user_name: comment.user_name || comment.from?.name || comment.user?.name || 'Unknown',
          message: comment.message || comment.text || 'No message',
          created_time: comment.created_time || comment.created_at || comment.createdAt || new Date().toISOString(),
          status: comment.status || 'active',
          reply_sent: comment.reply_sent || comment.replySent || false,
          reply_type: comment.reply_type || comment.replyType,
          error: comment.error,
        })) : [];
        setLogs(formattedLogs);
      } else {
        setLogs([]);
      }
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      if (!silent) {
        setLogs([]);
        toast({
          title: "Info",
          description: "No logs available yet. Logs will appear here once comments are processed.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (log: CommentLog) => {
    if (log.error) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        </Badge>
      );
    }
    if (log.reply_sent) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-full bg-gray-50 font-sans p-6 pb-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center">
            {platform === 'facebook' ? 'Facebook' : 'Instagram'} Comment Logs
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Live indicator */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 10 seconds</span>
        </div>

        {/* Loading state */}
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No comment logs found</p>
            <p className="text-sm text-gray-400 mt-2">Logs will appear here once comments are processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{log.user_name}</span>
                        {getStatusBadge(log)}
                        {log.reply_type && (
                          <Badge variant="outline">
                            {log.reply_type === 'private' ? 'Private' : 'Public'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Post ID: {log.post_id}</span>
                        <span>•</span>
                        <span>{formatDate(log.created_time)}</span>
                      </div>
                      {log.error && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <XCircle className="h-4 w-4" />
                          <span className="font-medium">Error: {log.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentLogs;
