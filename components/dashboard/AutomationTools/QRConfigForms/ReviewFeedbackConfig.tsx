"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewFeedbackConfigProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function ReviewFeedbackConfig({
  initialData,
  onSave,
  onCancel,
}: ReviewFeedbackConfigProps) {
  const [formData, setFormData] = useState({
    brand_name: initialData?.brand_name || "",
    shop_name: initialData?.shop_name || "",
    shop_address: initialData?.shop_address || "",
    product_name: initialData?.product_name || "",
    product_sku: initialData?.product_sku || "",
    google_review_url: initialData?.google_review_url || "",
    thank_you_message: initialData?.thank_you_message || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Feedback QR Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand / Business Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) =>
                  setFormData({ ...formData, brand_name: e.target.value })
                }
                required
                placeholder="Your brand name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_review_url">Google Review URL *</Label>
              <Input
                id="google_review_url"
                type="url"
                value={formData.google_review_url}
                onChange={(e) =>
                  setFormData({ ...formData, google_review_url: e.target.value })
                }
                required
                placeholder="https://g.page/r/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop / Outlet Name</Label>
              <Input
                id="shop_name"
                value={formData.shop_name}
                onChange={(e) =>
                  setFormData({ ...formData, shop_name: e.target.value })
                }
                placeholder="Outlet or shop name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_name">Product / Service Name</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                placeholder="Product name (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_sku">Product SKU / ID</Label>
              <Input
                id="product_sku"
                value={formData.product_sku}
                onChange={(e) =>
                  setFormData({ ...formData, product_sku: e.target.value })
                }
                placeholder="SKU123 (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_address">Shop Address</Label>
              <Textarea
                id="shop_address"
                value={formData.shop_address}
                onChange={(e) =>
                  setFormData({ ...formData, shop_address: e.target.value })
                }
                placeholder="Address shown on scan page"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank_you_message">Thank You / Info Message</Label>
            <Textarea
              id="thank_you_message"
              value={formData.thank_you_message}
              onChange={(e) =>
                setFormData({ ...formData, thank_you_message: e.target.value })
              }
              placeholder="Shown after submitting feedback"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Configuration</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

