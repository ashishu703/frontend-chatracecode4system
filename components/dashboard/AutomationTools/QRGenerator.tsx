"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ArrowLeft,
  Download,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppointmentBookingConfig from "./QRConfigForms/AppointmentBookingConfig";
import ReviewFeedbackConfig from "./QRConfigForms/ReviewFeedbackConfig";

interface QRGeneratorProps {
  onBack?: () => void;
}

interface QRPurpose {
  value: string;
  label: string;
  isSingle: boolean;
  helperText: string;
}

const QR_PURPOSES: QRPurpose[] = [
  {
    value: "appointment_booking",
    label: "Appointment / Booking QR",
    isSingle: true,
    helperText: "This QR will be reused by all users",
  },
  {
    value: "review_feedback",
    label: "Review & Feedback QR",
    isSingle: true,
    helperText: "This QR will be reused by all users",
  },
  {
    value: "product_original_check",
    label: "Product Original Check / Anti-Fake QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
  {
    value: "loyalty_rewards",
    label: "Loyalty & Rewards QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
  {
    value: "inventory_warehouse",
    label: "Inventory / Warehouse QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
  {
    value: "digital_menu_catalogue",
    label: "Digital Menu / Catalogue QR",
    isSingle: true,
    helperText: "This QR will be reused by all users",
  },
  {
    value: "event_attendance_access",
    label: "Event / Attendance / Access QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
  {
    value: "payments_invoice",
    label: "Payments & Invoice QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
  {
    value: "lead_capture_crm",
    label: "Lead Capture & CRM QR",
    isSingle: true,
    helperText: "This QR will be reused by all users",
  },
  {
    value: "marketing_campaign",
    label: "Marketing Campaign / Smart QR",
    isSingle: false,
    helperText: "Each QR will be unique and trackable",
  },
];

interface GeneratedQR {
  qrMaster: {
    qr_master_id: string;
    purpose: string;
    qr_type: string;
    qr_url: string;
    qr_image_url: string;
    status: string;
    total_scans: number;
    metadata?: any;
  };
  qrCodes: Array<{
    qr_id: string;
    unique_token: string;
    qr_url: string;
    qr_image_url: string;
    status: string;
    scan_count: number;
  }>;
  type: string;
  count: number;
}

export default function QRGenerator({ onBack }: QRGeneratorProps) {
  const { toast } = useToast();
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [myQRCodes, setMyQRCodes] = useState<any[]>([]);
  const [showMyQRCodes, setShowMyQRCodes] = useState<boolean>(false);
  const [showConfiguration, setShowConfiguration] = useState<boolean>(false);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  const selectedPurposeData = QR_PURPOSES.find(
    (p) => p.value === selectedPurpose
  );

  useEffect(() => {
    if (selectedPurposeData?.isSingle) {
      setQuantity(1);
    }
  }, [selectedPurpose]);

  const handleGenerate = async () => {
    if (!selectedPurpose) {
      toast({
        title: "Validation Error",
        description: "Please select a QR purpose",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPurposeData?.isSingle && quantity < 1) {
      toast({
        title: "Validation Error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await serverHandler.post("/api/user/qr/generate", {
        purpose: selectedPurpose,
        quantity: selectedPurposeData?.isSingle ? 1 : quantity,
        metadata: {},
      });

      if (response.data?.success) {
        setGeneratedQR(response.data.data);
        toast({
          title: "Success",
          description: "QR codes generated successfully!",
          variant: "default",
        });
        // Show configuration form for single QR purposes we support
        if (
          selectedPurposeData?.isSingle &&
          ["appointment_booking", "review_feedback"].includes(selectedPurpose)
        ) {
          setShowConfiguration(true);
        }
        // Refresh QR codes list
        fetchMyQRCodes();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to generate QR codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQRCodes = async () => {
    try {
      const response = await serverHandler.get("/api/user/qr/list");
      if (response.data?.success) {
        setMyQRCodes(response.data.data?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch QR codes:", error);
    }
  };

  useEffect(() => {
    fetchMyQRCodes();
  }, []);

  const handleDownload = async (qrMasterId: string, type: string) => {
    try {
      if (type === "single") {
        // For single QR, download the image directly
        const response = await serverHandler.get(
          `/api/user/qr/download/${qrMasterId}`
        );
        if (response.data?.success && response.data.qrImage) {
          // Convert base64 to blob and download
          const base64Data = response.data.qrImage.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `qr_${qrMasterId}.png`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        // For bulk QR, download ZIP
        window.open(`/api/user/qr/download/${qrMasterId}?format=zip`, "_blank");
      }
      toast({
        title: "Success",
        description: "Download started",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to download",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = async (qrMasterId: string) => {
    try {
      const response = await serverHandler.get(
        `/api/user/qr/analytics/${qrMasterId}`
      );
      if (response.data?.success) {
        const analytics = response.data.analytics;
        toast({
          title: "Analytics",
          description: `Total Scans: ${analytics.totalScans}, Active: ${analytics.activeQRCodes}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  if (showMyQRCodes) {
    return (
      <div className="bg-gray-50 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowMyQRCodes(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">My QR Codes</h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generated QR Codes</CardTitle>
              <CardDescription>
                View and manage all your generated QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myQRCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No QR codes generated yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    myQRCodes.map((qrMaster: any) => (
                      <TableRow key={qrMaster.qr_master_id}>
                        <TableCell>
                          {
                            QR_PURPOSES.find((p) => p.value === qrMaster.purpose)
                              ?.label
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              qrMaster.qr_type === "single"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {qrMaster.qr_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              qrMaster.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {qrMaster.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{qrMaster.total_scans || 0}</TableCell>
                        <TableCell>
                          {new Date(qrMaster.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownload(
                                  qrMaster.qr_master_id,
                                  qrMaster.qr_type
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewAnalytics(qrMaster.qr_master_id)
                              }
                            >
                              Analytics
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Automation Tools
          </Button>
        )}

        <div className="flex items-center justify-end mb-6">
          <Button
            variant="outline"
            onClick={() => setShowMyQRCodes(true)}
          >
            View My QR Codes
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
            <CardDescription>
              Select a purpose and configure your QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="purpose">QR Purpose</Label>
              <Select
                value={selectedPurpose}
                onValueChange={setSelectedPurpose}
              >
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select QR purpose" />
                </SelectTrigger>
                <SelectContent>
                  {QR_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPurposeData && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selectedPurposeData.helperText}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Number of QR Codes to Generate
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={selectedPurposeData?.isSingle || false}
                className={selectedPurposeData?.isSingle ? "bg-gray-100" : ""}
              />
              {selectedPurposeData?.isSingle && (
                <p className="text-sm text-gray-500">
                  Quantity is fixed to 1 for this purpose
                </p>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedPurpose}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code{quantity > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  QR Code{generatedQR.count > 1 ? "s" : ""} Generated
                  Successfully
                </CardTitle>
                <CardDescription>
                  {generatedQR.count} QR code{generatedQR.count > 1 ? "s" : ""}{" "}
                  generated for{" "}
                  {
                    QR_PURPOSES.find(
                      (p) => p.value === generatedQR.qrMaster.purpose
                    )?.label
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedQR.type === "single" ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <img
                        src={generatedQR.qrMaster.qr_image_url}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        QR URL: {generatedQR.qrMaster.qr_url}
                      </p>
                      <Button
                        onClick={() =>
                          handleDownload(
                            generatedQR.qrMaster.qr_master_id,
                            "single"
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {generatedQR.count} unique QR codes have been generated.
                        Download them as a ZIP file.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {generatedQR.qrCodes.slice(0, 20).map((qr, index) => (
                        <div
                          key={qr.qr_id}
                          className="border rounded-lg p-2 flex flex-col items-center"
                        >
                          <img
                            src={qr.qr_image_url}
                            alt={`QR ${index + 1}`}
                            className="w-32 h-32"
                          />
                          <p className="text-xs mt-2 text-center">
                            QR #{index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                    {generatedQR.qrCodes.length > 20 && (
                      <p className="text-sm text-gray-500 text-center">
                        Showing first 20 of {generatedQR.qrCodes.length} QR
                        codes
                      </p>
                    )}
                    <Button
                      onClick={() =>
                        handleDownload(
                          generatedQR.qrMaster.qr_master_id,
                          "unique"
                        )
                      }
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download All as ZIP ({generatedQR.count} QR codes)
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleViewAnalytics(generatedQR.qrMaster.qr_master_id)
                    }
                  >
                    View Analytics
                  </Button>
                  {["appointment_booking", "review_feedback"].includes(
                    selectedPurpose
                  ) && (
                    <Button
                      variant="outline"
                      onClick={() => setShowConfiguration(true)}
                    >
                      Configure QR
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedQR(null);
                      setSelectedPurpose("");
                      setQuantity(1);
                      setShowConfiguration(false);
                    }}
                  >
                    Generate Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showConfiguration && generatedQR && selectedPurpose === "appointment_booking" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <AppointmentBookingConfig
              initialData={generatedQR.qrMaster.metadata || {}}
              onSave={async (configData) => {
                try {
                  setSavingConfig(true);
                  const response = await serverHandler.put(
                    `/api/user/qr/configure/${generatedQR.qrMaster.qr_master_id}`,
                    { configuration: configData }
                  );
                  if (response.data?.success) {
                    toast({
                      title: "Success",
                      description: "QR configuration saved successfully!",
                      variant: "default",
                    });
                    setShowConfiguration(false);
                    // Update generated QR with new metadata
                    setGeneratedQR({
                      ...generatedQR,
                      qrMaster: {
                        ...generatedQR.qrMaster,
                        metadata: configData,
                      } as GeneratedQR['qrMaster'],
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.response?.data?.msg || "Failed to save configuration",
                    variant: "destructive",
                  });
                } finally {
                  setSavingConfig(false);
                }
              }}
              onCancel={() => setShowConfiguration(false)}
            />
          </motion.div>
        )}

        {showConfiguration && generatedQR && selectedPurpose === "review_feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <ReviewFeedbackConfig
              initialData={generatedQR.qrMaster.metadata || {}}
              onSave={async (configData) => {
                try {
                  setSavingConfig(true);
                  const response = await serverHandler.put(
                    `/api/user/qr/configure/${generatedQR.qrMaster.qr_master_id}`,
                    { configuration: configData }
                  );
                  if (response.data?.success) {
                    toast({
                      title: "Success",
                      description: "QR configuration saved successfully!",
                      variant: "default",
                    });
                    setShowConfiguration(false);
                    setGeneratedQR({
                      ...generatedQR,
                      qrMaster: {
                        ...generatedQR.qrMaster,
                        metadata: configData,
                      } as GeneratedQR["qrMaster"],
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description:
                      error.response?.data?.msg ||
                      "Failed to save configuration",
                    variant: "destructive",
                  });
                } finally {
                  setSavingConfig(false);
                }
              }}
              onCancel={() => setShowConfiguration(false)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
