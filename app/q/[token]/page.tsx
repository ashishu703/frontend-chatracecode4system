"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import AppointmentBookingPage from "@/components/qr-scan/AppointmentBookingPage";
import ReviewFeedbackPage from "@/components/qr-scan/ReviewFeedbackPage";
import ProductCheckPage from "@/components/qr-scan/ProductCheckPage";
import LoyaltyRewardsPage from "@/components/qr-scan/LoyaltyRewardsPage";
import InventoryPage from "@/components/qr-scan/InventoryPage";
import DigitalMenuPage from "@/components/qr-scan/DigitalMenuPage";
import EventAttendancePage from "@/components/qr-scan/EventAttendancePage";
import PaymentInvoicePage from "@/components/qr-scan/PaymentInvoicePage";
import LeadCapturePage from "@/components/qr-scan/LeadCapturePage";
import MarketingCampaignPage from "@/components/qr-scan/MarketingCampaignPage";

export default function QRScanPage() {
  const params = useParams();
  const token = params.token as string;
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serverHandler.get(`/api/qr/data/${token}`);
      
      if (response.data?.success) {
        setQrData(response.data.data);
      } else {
        setError("QR code not found or inactive");
      }
    } catch (err: any) {
      console.error("Error fetching QR data:", err);
      setError(err.response?.data?.msg || "Failed to load QR code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQRData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">QR Code Not Found</h1>
          <p className="text-gray-600">{error || "The QR code you're looking for doesn't exist or has been deactivated."}</p>
        </div>
      </div>
    );
  }

  const { purpose, metadata, qrMaster, qrCode } = qrData;

  // Render purpose-specific page
  const renderPurposePage = () => {
    const props = {
      qrData: qrData,
      metadata: metadata,
      qrMaster: qrMaster,
      qrCode: qrCode,
    };

    switch (purpose) {
      case "appointment_booking":
        return <AppointmentBookingPage {...props} />;
      case "review_feedback":
        return <ReviewFeedbackPage {...props} />;
      case "product_original_check":
        return <ProductCheckPage {...props} />;
      case "loyalty_rewards":
        return <LoyaltyRewardsPage {...props} />;
      case "inventory_warehouse":
        return <InventoryPage {...props} />;
      case "digital_menu_catalogue":
        return <DigitalMenuPage {...props} />;
      case "event_attendance_access":
        return <EventAttendancePage {...props} />;
      case "payments_invoice":
        return <PaymentInvoicePage {...props} />;
      case "lead_capture_crm":
        return <LeadCapturePage {...props} />;
      case "marketing_campaign":
        return <MarketingCampaignPage {...props} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Unknown QR purpose</p>
          </div>
        );
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderPurposePage()}</div>;
}
