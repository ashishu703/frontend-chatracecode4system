"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Send, MapPin, Package, Link2 } from "lucide-react";
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { useToast } from "@/hooks/use-toast";

interface ReviewFeedbackPageProps {
  qrData?: any;
  metadata?: any;
  qrMaster?: any;
  qrCode?: any;
}

export default function ReviewFeedbackPage({ qrCode, metadata = {} }: ReviewFeedbackPageProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const googleReviewUrl = metadata.google_review_url || metadata.googleReviewUrl;
  const shopName = metadata.shop_name || metadata.shopName;
  const shopAddress = metadata.shop_address || metadata.shopAddress;
  const productName = metadata.product_name || metadata.productName;
  const productSku = metadata.product_sku || metadata.productSku;
  const thankYouMessage = metadata.thank_you_message;

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating >= 4) {
      if (!googleReviewUrl) {
        toast({
          title: "Missing Google review link",
          description: "Please contact the business – review link is not configured.",
          variant: "destructive",
        });
        return;
      }
      // For positive reviews, we still might want to track them
      try {
        await serverHandler.post('/api/qr/feedback', {
          token: qrCode?.unique_token,
          rating,
          comment: "Redirected to Google",
          isInternal: false
        });
      } catch (err) {}
      
      // Redirect to Google Review
      window.location.href = googleReviewUrl;
    } else {
      // Show feedback form if not already showing
      if (comment === "" && !submitted) {
        // Just let them type now
        return;
      }

      setLoading(true);
      try {
        await serverHandler.post('/api/qr/feedback', {
          token: qrCode?.unique_token,
          rating,
          comment,
          isInternal: true
        });
        setSubmitted(true);
      } catch (err) {
        toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Thank you for your feedback!</h2>
            <p className="text-gray-600">
              {thankYouMessage || "We appreciate your input."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full shadow-xl border-2 border-green-100 rounded-3xl overflow-hidden">
        <div className="bg-green-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">{metadata.brand_name || "Rate Us"}</h1>
          <p className="text-green-100 opacity-90">
            {shopName ? `You're rating ${shopName}` : "We value your feedback"}
          </p>
        </div>
        <CardContent className="p-8 text-center space-y-6">
          {(shopName || shopAddress || productName || productSku) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2">
              {shopName && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{shopName}</span>
                </div>
              )}
              {shopAddress && (
                <p className="text-sm text-gray-600 pl-6">{shopAddress}</p>
              )}
              {productName && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Package className="h-4 w-4 text-green-600" />
                  <span>{productName}</span>
                  {productSku && (
                    <span className="text-xs text-gray-500">({productSku})</span>
                  )}
                </div>
              )}
              {googleReviewUrl && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Link2 className="h-4 w-4 text-green-600" />
                  <span>Positive ratings jump to Google review page.</span>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-600 font-medium text-lg">How would you rate your experience?</p>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-12 w-12 transition-colors ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && rating <= 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-sm text-red-500 font-semibold bg-red-50 py-2 rounded-lg">
                We're sorry to hear that. Please tell us what went wrong.
              </p>
              <Textarea
                placeholder="Share your concerns with us privately..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || (rating <= 3 && comment.trim() === "") || loading}
            className={`w-full py-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
              rating >= 4 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Send className="h-5 w-5 animate-pulse" /> Submitting...
              </span>
            ) : rating >= 4 ? (
              "Continue to Google Review"
            ) : (
              "Submit Feedback"
            )}
          </Button>
          
          <p className="text-[10px] text-gray-400 italic">
            Your feedback helps us improve our service every day.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
