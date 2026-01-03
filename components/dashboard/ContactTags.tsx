"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  X,
  FolderOpen,
  Check,
} from "lucide-react";
import { Contact } from "@/utils/api/contacts/Contact";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ContactTags() {
  const [phonebookPage] = useState(1);
  const [phonebookPageSize] = useState(100);
  const [allPhonebooks, setAllPhonebooks] = useState<any[]>([]);
  const [addPhonebookModal, setAddPhonebookModal] = useState(false);
  const [phonebookForm, setPhonebookForm] = useState({ name: "" });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contactsResponse } = useQuery({
    queryKey: ["contacts"],
    queryFn: Contact.getContacts,
  });

  const { data: phonebooksResponse, isLoading: phonebooksLoading } = useQuery({
    queryKey: ["phonebooks", phonebookPage],
    queryFn: () => Contact.getPhonebooks(phonebookPage, phonebookPageSize),
  });

  const contacts = contactsResponse?.data || [];
  const phonebooks = phonebooksResponse?.data || [];

  useEffect(() => {
    if (phonebooks.length > 0) {
      setAllPhonebooks(phonebooks);
    }
  }, [phonebooks]);

  const getContactCount = useMemo(() => {
    return (phonebookId: string | number) => {
      if (phonebookId === "all") return contacts.length;
      return contacts.filter(
        (c: any) => c.phonebook_id?.toString() === phonebookId.toString()
      ).length;
    };
  }, [contacts]);

  const addPhonebookMutation = useMutation({
    mutationFn: Contact.addPhonebook,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tag created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["phonebooks"] });
      setAddPhonebookModal(false);
      setPhonebookForm({ name: "" });
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handleAddPhonebook = (e: React.FormEvent) => {
    e.preventDefault();
    addPhonebookMutation.mutate({ name: phonebookForm.name });
  };

  const handleSelectAll = () => {
    if (selectedTags.length === allPhonebooks.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(allPhonebooks.map((pb: any) => pb.id.toString()));
    }
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0 rounded-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Tags</h3>
            <Button
              onClick={() => setAddPhonebookModal(true)}
              size="sm"
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {phonebooksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading tags...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        allPhonebooks.length > 0 &&
                        selectedTags.length === allPhonebooks.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Contacts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* All Contacts Row */}
                <TableRow>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes("all")}
                      onChange={() => handleTagSelect("all")}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">All Contacts</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{getContactCount("all")}</span>
                  </TableCell>
                </TableRow>

                {/* Individual Tags */}
                {allPhonebooks.map((phonebook: any) => (
                  <TableRow key={phonebook.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(phonebook.id.toString())}
                        onChange={() => handleTagSelect(phonebook.id.toString())}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{phonebook.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {getContactCount(phonebook.id)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {allPhonebooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                      No tags found. Create your first tag to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Tag Modal */}
      {addPhonebookModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <motion.div
            className="bg-white p-8 rounded-xl shadow-2xl w-[500px] max-w-[90vw] relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Create New Tag</h2>
              <button
                onClick={() => setAddPhonebookModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddPhonebook} className="space-y-6">
              <div>
                <label
                  htmlFor="tagName"
                  className="block text-xs font-medium text-gray-700 mb-2"
                >
                  Tag Name
                </label>
                <Input
                  id="tagName"
                  placeholder="Enter a descriptive name for your tag"
                  required
                  value={phonebookForm.name}
                  onChange={(e) =>
                    setPhonebookForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {phonebookForm.name.length}/50 characters
                </p>
              </div>

              {/* Tag Organization Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">
                  Tag Organization Tips:
                </h3>
                <ul className="space-y-2 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Use clear, descriptive names (e.g., "VIP Customers", "Follow-up Required")
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Keep names under 50 characters for better display</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Tags help organize contacts by purpose, priority, or status
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddPhonebookModal(false)}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addPhonebookMutation.isPending || !phonebookForm.name.trim()
                  }
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700"
                >
                  {addPhonebookMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Tag"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}