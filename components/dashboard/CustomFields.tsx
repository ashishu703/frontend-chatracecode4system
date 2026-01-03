"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalWrapper } from "./helpers/ModalWrapper";
import { Plus, X, Settings, Text, Hash, Calendar, CheckSquare, List, MoreVertical, Trash2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomField {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  required: boolean;
}

export default function CustomFields() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [addFieldModal, setAddFieldModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldForm, setFieldForm] = useState({
    name: "",
    type: "text",
    defaultValue: "",
    required: false,
  });

  const pageSize = 10;

  const fieldTypes = [
    { value: "text", label: "text" },
    { value: "number", label: "number" },
    { value: "date", label: "date" },
    { value: "select", label: "select" },
    { value: "multiselect", label: "multiselect" },
    { value: "boolean", label: "boolean" },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return Text;
      case "number":
        return Hash;
      case "date":
        return Calendar;
      case "select":
      case "multiselect":
        return List;
      case "boolean":
        return CheckSquare;
      default:
        return Settings;
    }
  };

  const filteredFields = customFields.filter((field) =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFields.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFields = filteredFields.slice(startIndex, endIndex);

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldForm.name.trim()) {
      const newField: CustomField = {
        id: Date.now().toString(),
        name: fieldForm.name,
        type: fieldForm.type,
        defaultValue: fieldForm.defaultValue || undefined,
        required: fieldForm.required,
      };
      setCustomFields([...customFields, newField]);
      setFieldForm({ name: "", type: "text", defaultValue: "", required: false });
      setAddFieldModal(false);
    }
  };

  const handleDeleteField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
    setSelectedFields(selectedFields.filter((fieldId) => fieldId !== id));
  };

  const handleSelectAll = () => {
    if (selectedFields.length === paginatedFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(paginatedFields.map((field) => field.id));
    }
  };

  const handleSelectField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((fieldId) => fieldId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0 rounded-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Custom Fields</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-64 h-9"
                />
              </div>
              <Button
                onClick={() => setAddFieldModal(true)}
                size="sm"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {customFields.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">No custom fields yet</p>
              <p className="text-gray-400 text-sm">
                Add custom fields to capture additional information about your contacts
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            paginatedFields.length > 0 &&
                            selectedFields.length === paginatedFields.length
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFields.map((field) => {
                      const TypeIcon = getTypeIcon(field.type);
                      return (
                        <TableRow key={field.id} className="hover:bg-gray-50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedFields.includes(field.id)}
                              onChange={() => handleSelectField(field.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{field.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 capitalize">{field.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteField(field.id)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Field Modal */}
      <ModalWrapper
        isOpen={addFieldModal}
        onClose={() => {
          setAddFieldModal(false);
          setFieldForm({ name: "", type: "text", defaultValue: "", required: false });
        }}
        title="Add Custom Field"
        className="w-[500px] max-w-[90vw]"
      >
        <form onSubmit={handleAddField} className="space-y-6 -mt-6">
          <div>
            <label
              htmlFor="fieldLabel"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              Label
            </label>
            <Input
              id="fieldLabel"
              placeholder="e.g. Preferred Language"
              required
              value={fieldForm.name}
              onChange={(e) =>
                setFieldForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="fieldType"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              Type
            </label>
            <Select
              value={fieldForm.type}
              onValueChange={(value) =>
                setFieldForm((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[10000] bg-white border border-gray-200 shadow-lg">
                {fieldTypes.map((type) => {
                  const IconComponent = getTypeIcon(type.value);
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="defaultValue"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              Default Value <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <Input
              id="defaultValue"
              placeholder="Enter default value"
              value={fieldForm.defaultValue}
              onChange={(e) =>
                setFieldForm((prev) => ({
                  ...prev,
                  defaultValue: e.target.value,
                }))
              }
              className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddFieldModal(false);
                setFieldForm({ name: "", type: "text", defaultValue: "", required: false });
              }}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fieldForm.name.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700"
            >
              Add Field
            </Button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
