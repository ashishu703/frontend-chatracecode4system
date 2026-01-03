"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ProductCheckPageProps {
  qrData?: any;
  metadata?: any;
  qrMaster?: any;
  qrCode?: any;
}

export default function ProductCheckPage({ qrCode = { scan_count: 0, status: "active" }, metadata = {} }: ProductCheckPageProps) {
  const isFirstScan = qrCode.scan_count === 0;
  const isValid = qrCode.status === "active";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {isValid && isFirstScan ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-600">Genuine Product</h1>
              <p className="text-gray-600 mb-4">{metadata.product_name || "Product Verified"}</p>
              <div className="space-y-2 text-left bg-gray-50 p-4 rounded">
                {metadata.batch_number && (
                  <p><strong>Batch:</strong> {metadata.batch_number}</p>
                )}
                {metadata.manufacturing_date && (
                  <p><strong>Manufacturing Date:</strong> {metadata.manufacturing_date}</p>
                )}
                {metadata.brand && <p><strong>Brand:</strong> {metadata.brand}</p>}
              </div>
            </>
          ) : isFirstScan === false ? (
            <>
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-yellow-600">Already Scanned</h1>
              <p className="text-gray-600">This QR code has been scanned before.</p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-600">Invalid QR Code</h1>
              <p className="text-gray-600">This product may be fake or tampered.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
