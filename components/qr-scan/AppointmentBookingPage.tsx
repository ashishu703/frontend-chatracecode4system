"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageCircle, Globe, Calendar, Clock } from "lucide-react";
import Image from "next/image";

interface AppointmentBookingPageProps {
  qrData: any;
  metadata: any;
  qrMaster: any;
  qrCode: any;
}

export default function AppointmentBookingPage({
  metadata,
}: AppointmentBookingPageProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientName: "",
    mobile: "",
    department: "",
    doctor: "",
    date: "",
    time: "",
  });

  const handleCall = () => {
    if (metadata.contact) {
      window.location.href = `tel:${metadata.contact}`;
    }
  };

  const handleWhatsApp = () => {
    if (metadata.whatsapp) {
      const message = encodeURIComponent(
        `Hello, I would like to book an appointment.`
      );
      window.open(`https://wa.me/${metadata.whatsapp}?text=${message}`, "_blank");
    }
  };

  const handleWebsite = () => {
    if (metadata.website) {
      window.open(metadata.website, "_blank");
    }
  };

  const handleBookAppointment = () => {
    if (metadata.booking_mode === "WEBSITE" && metadata.website) {
      handleWebsite();
    } else {
      setShowBookingForm(true);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit booking to backend
    alert("Appointment booking submitted! (Backend integration pending)");
    setShowBookingForm(false);
  };

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={bookingData.patientName}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, patientName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={bookingData.mobile}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, mobile: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={bookingData.department}
                    onValueChange={(value) =>
                      setBookingData({ ...bookingData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata.departments?.map((dept: string, i: number) => (
                        <SelectItem key={i} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor *</Label>
                  <Select
                    value={bookingData.doctor}
                    onValueChange={(value) =>
                      setBookingData({ ...bookingData, doctor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata.doctors
                        ?.filter((d: any) => d.department === bookingData.department)
                        .map((doctor: any, i: number) => (
                          <SelectItem key={i} value={doctor.name}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingData.date}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={bookingData.time}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Book Appointment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            {metadata.logo && (
              <div className="flex justify-center mb-6">
                <Image
                  src={metadata.logo}
                  alt={metadata.brand_name || "Logo"}
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
              </div>
            )}

            <h1 className="text-3xl font-bold text-center mb-2">
              {metadata.brand_name || "Hospital"}
            </h1>

            {metadata.address && (
              <p className="text-gray-600 text-center mb-6">{metadata.address}</p>
            )}

            {metadata.opd_timings && (
              <div className="flex items-center justify-center gap-2 mb-6 text-gray-700">
                <Clock className="h-5 w-5" />
                <span>{metadata.opd_timings}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button
                onClick={handleCall}
                variant="outline"
                className="w-full"
                disabled={!metadata.contact}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Us
              </Button>

              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="w-full"
                disabled={!metadata.whatsapp}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>

            <Button
              onClick={handleBookAppointment}
              className="w-full mb-4"
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Appointment
            </Button>

            {metadata.website && (
              <Button
                onClick={handleWebsite}
                variant="outline"
                className="w-full"
              >
                <Globe className="mr-2 h-4 w-4" />
                Visit Website
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
