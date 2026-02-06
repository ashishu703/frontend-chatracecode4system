"use client"

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function ReviewManagementView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [connecting, setConnecting] = useState(false);

  const { data: reviews, isLoading, error } = useQuery<any[]>({
    queryKey: ['google-reviews', activeTab],
    queryFn: async () => {
      const response = await serverHandler.get(`/api/google/reviews?status=${activeTab !== 'all' ? activeTab : ''}`);
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
  });

  const { data: connectionStatus, isLoading: connectionLoading, error: connectionError, refetch: refetchConnection } = useQuery({
    queryKey: ['google-connection-status'],
    queryFn: async () => {
      const response = await serverHandler.get('/api/google/status');
      return response.data?.data || response.data || { isConnected: false };
    },
    retry: 1,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await serverHandler.patch(`/api/google/reviews/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-reviews'] });
    },
  });

  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      const response = await serverHandler.get('/api/google/auth');
      const authUrl = response.data?.data?.url || response.data?.url;
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
    } catch (err) {
      console.error('Failed to initiate Google auth:', err);
    } finally {
      setConnecting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (connectionLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (!connectionStatus?.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-green-100 max-w-lg w-full">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
            <FontAwesomeIcon icon={faGoogle} className="text-4xl text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Google Business</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Manage your Google Business reviews directly from here. Auto-reply to positive reviews and handle negative ones manually to protect your reputation.
          </p>
          {connectionError && (
            <div className="text-sm text-red-600 mb-4 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Connection check failed. Please try again.</span>
            </div>
          )}
          <Button 
            onClick={handleConnectGoogle}
            disabled={connecting}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-6 rounded-xl text-lg font-bold shadow-lg transition-all transform hover:scale-105"
          >
            {connecting ? 'Opening Google...' : 'Connect My Business Profile'}
          </Button>
          <div className="mt-4 text-xs text-gray-500">
            Make sure callback URL & credentials are set in Admin & Google Cloud.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-green-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faGoogle} className="text-green-600" />
            Review Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor and respond to your customer feedback automatically</p>
        </div>
        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src={connectionStatus.profile?.picture || "https://github.com/shadcn.png"} alt="Profile" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-green-800 leading-tight">{connectionStatus.profile?.name}</span>
            <span className="text-xs text-green-600">Connected Profile</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs text-green-700"
            onClick={() => {
              refetchConnection();
              queryClient.invalidateQueries({ queryKey: ['google-reviews'] });
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar/Stats */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-2 border-green-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-700 font-medium">Positive</span>
                <span className="text-xl font-bold text-green-800">85%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-red-700 font-medium">Needs Attention</span>
                <span className="text-xl font-bold text-red-800">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-700 font-medium">Auto-Replied</span>
                <span className="text-xl font-bold text-blue-800">124</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              AI Automation Active
            </h4>
            <p className="text-xs text-green-100 leading-relaxed">
              We are automatically replying to all 4 & 5 star reviews using your brand voice. 
              1-3 star reviews are held for your manual review.
            </p>
          </div>
        </div>

        {/* Review Feed */}
        <div className="lg:col-span-9 space-y-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border-2 border-green-100 p-1 rounded-xl h-auto mb-6 shadow-sm">
              <TabsTrigger value="all" className="rounded-lg py-2 px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">All Reviews</TabsTrigger>
              <TabsTrigger value="new" className="rounded-lg py-2 px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">New (1-3 ⭐)</TabsTrigger>
              <TabsTrigger value="in_review" className="rounded-lg py-2 px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">In Review</TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-lg py-2 px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">Resolved</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-red-100 text-red-600 font-medium">
                    Failed to load reviews. Please refresh.
                  </div>
                ) : reviews?.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No reviews found in this category</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(Array.isArray(reviews) ? reviews : []).map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
                          !review.isPositive ? "border-red-100" : "border-green-100"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shadow-sm border border-gray-200 flex-shrink-0">
                              <img src={review.reviewerPhotoUrl || `https://ui-avatars.com/api/?name=${review.reviewerName}`} alt={review.reviewerName} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-800 text-lg">{review.reviewerName}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(review.reviewTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`${
                            review.reviewStatus === 'new' ? "bg-red-50 text-red-600 border-red-200" :
                            review.reviewStatus === 'in_review' ? "bg-blue-50 text-blue-600 border-blue-200" :
                            "bg-green-50 text-green-600 border-green-200"
                          } px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                            {review.reviewStatus.replace('_', ' ')}
                          </Badge>
                        </div>

                        <p className="mt-4 text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
                          "{review.comment}"
                        </p>

                        {review.replyText && (
                          <div className="mt-4 bg-green-50 p-4 rounded-xl border border-green-100 relative">
                            <div className="absolute -top-2 left-4 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">AI Reply</div>
                            <p className="text-green-800 text-sm italic">"{review.replyText}"</p>
                          </div>
                        )}

                        {!review.isPositive && review.reviewStatus !== 'resolved' && (
                          <div className="mt-6 flex items-center gap-3 border-t pt-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: review.id, status: 'in_review' })}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg font-bold"
                            >
                              Move to Review
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-sm"
                              onClick={() => updateStatusMutation.mutate({ id: review.id, status: 'resolved' })}
                            >
                              Mark as Resolved
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600 ml-auto font-bold">
                              Hide Review
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

