"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentBookingConfigProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function AppointmentBookingConfig({
  initialData,
  onSave,
  onCancel,
}: AppointmentBookingConfigProps) {
  const [formData, setFormData] = useState({
    brand_name: initialData?.brand_name || "",
    logo: initialData?.logo || "",
    address: initialData?.address || "",
    opd_timings: initialData?.opd_timings || "",
    contact: initialData?.contact || "",
    whatsapp: initialData?.whatsapp || "",
    website: initialData?.website || "",
    booking_mode: initialData?.booking_mode || "IN_APP",
    departments: initialData?.departments || [],
    doctors: initialData?.doctors || [],
    ...initialData,
  });

  const [newDepartment, setNewDepartment] = useState("");
  const [newDoctor, setNewDoctor] = useState({ name: "", department: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addDepartment = () => {
    if (newDepartment.trim()) {
      setFormData({
        ...formData,
        departments: [...formData.departments, newDepartment.trim()],
      });
      setNewDepartment("");
    }
  };

  const removeDepartment = (index: number) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter((_: any, i: number) => i !== index),
    });
  };

  const addDoctor = () => {
    if (newDoctor.name.trim() && newDoctor.department) {
      setFormData({
        ...formData,
        doctors: [...formData.doctors, { ...newDoctor }],
      });
      setNewDoctor({ name: "", department: "" });
    }
  };

  const removeDoctor = (index: number) => {
    setFormData({
      ...formData,
      doctors: formData.doctors.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Booking Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) =>
                  setFormData({ ...formData, brand_name: e.target.value })
                }
                required
                placeholder="e.g., ABC Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              placeholder="Full address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opd_timings">OPD Timings *</Label>
            <Input
              id="opd_timings"
              value={formData.opd_timings}
              onChange={(e) =>
                setFormData({ ...formData, opd_timings: e.target.value })
              }
              required
              placeholder="e.g., Mon-Fri: 9 AM - 6 PM"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
                placeholder="9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                required
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_mode">Booking Mode *</Label>
            <Select
              value={formData.booking_mode}
              onValueChange={(value) =>
                setFormData({ ...formData, booking_mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_APP">In-App Booking</SelectItem>
                <SelectItem value="WEBSITE">Redirect to Website</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Departments</Label>
            <div className="flex gap-2">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Add department"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDepartment();
                  }
                }}
              />
              <Button type="button" onClick={addDepartment} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.departments.map((dept: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{dept}</span>
                  <button
                    type="button"
                    onClick={() => removeDepartment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Doctors</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newDoctor.name}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, name: e.target.value })
                }
                placeholder="Doctor name"
              />
              <Input
                value={newDoctor.department}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, department: e.target.value })
                }
                placeholder="Department"
              />
              <Button type="button" onClick={addDoctor} variant="outline">
                Add Doctor
              </Button>
            </div>
            <div className="space-y-2">
              {formData.doctors.map((doctor: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                >
                  <span>
                    {doctor.name} - {doctor.department}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDoctor(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Save Configuration
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
