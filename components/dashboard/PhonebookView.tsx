"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Upload,
  Trash2,
  Search,
  Plus,
  X,
  FolderOpen,
  Info,
  MoreVertical,
  Check,
} from "lucide-react";
import { Contact } from "@/utils/api/contacts/Contact";

// Optimized Contact Row Component
const ContactRow = memo(({ 
  contact, 
  selectedContacts, 
  setSelectedContacts, 
  displayPhonebooks, 
  assignedTo, 
  handleAssignedToChange,
  onAssignToTag
}: {
  contact: any;
  selectedContacts: string[];
  setSelectedContacts: (contacts: string[]) => void;
  displayPhonebooks: any[];
  assignedTo: { [key: string]: string };
  handleAssignedToChange: (contactId: string, value: string) => void;
  onAssignToTag: (contactId: string) => void;
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Click outside handler for actions menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showActionsMenu && !target.closest('.actions-menu-container')) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsMenu]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | any) => {
    setSelectedContacts(
      e.target.checked
        ? [...selectedContacts, contact.id]
        : selectedContacts.filter((id) => id !== contact.id)
    );
  }, [contact.id, selectedContacts, setSelectedContacts]);

  const getPhonebookName = useMemo(() => {
    if (contact.phonebook_id) {
      const phonebook = displayPhonebooks.find(
        (p) => p.id.toString() === contact.phonebook_id.toString()
      );
      return phonebook ? phonebook.name : "Unknown Tag";
    }
    return "No Tag";
  }, [contact.phonebook_id, displayPhonebooks]);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selectedContacts.includes(contact.id)}
          onChange={handleCheckboxChange}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs">
              {contact.first_name && contact.last_name
                ? `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`
                : contact.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {contact.first_name && contact.last_name
                ? `${contact.first_name} ${contact.last_name}`
                : contact.name || "N/A"}
            </div>
            {contact.email && (
              <div className="text-sm text-gray-500">
                {contact.email}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">
          {contact.mobile || contact.phone || "N/A"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">
          {getPhonebookName}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">
          {contact.source || "Manual"}
        </span>
      </td>
      <td className="px-4 py-3">
        <Select
          value={assignedTo[contact.id] || "unassigned"}
          onValueChange={(value) => handleAssignedToChange(contact.id, value)}
        >
          <SelectTrigger className="w-full h-8 text-sm border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[10000] bg-white border border-gray-200 shadow-lg">
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="ashish">Ashish</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <div className="relative actions-menu-container">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
          
          {showActionsMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
              <div className="p-1">
                <button
                  onClick={() => {
                    onAssignToTag(contact.id);
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-700"
                >
                  <FolderOpen className="h-4 w-4" />
                  Assign to Tag
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function PhonebookView() {
  // Core state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedPhonebook, setSelectedPhonebook] = useState<string>("all");
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [phonebookPage, setPhonebookPage] = useState(1);
  const [phonebookPageSize] = useState(10);
  const [allPhonebooks, setAllPhonebooks] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<{ [key: string]: string }>({});
  const [addContactModal, setAddContactModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [addPhonebookModal, setAddPhonebookModal] = useState(false);
  const [reassignModal, setReassignModal] = useState(false);
  const [targetPhonebookForReassign, setTargetPhonebookForReassign] =
    useState<string>("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    gender: "",
  });
  const [phonebookForm, setPhonebookForm] = useState({ name: "" });
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API queries
  const { data: contactsResponse, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: Contact.getContacts,
  });

  const { data: phonebooksResponse, isLoading: phonebooksLoading } = useQuery({
    queryKey: ["phonebooks", phonebookPage],
    queryFn: () => Contact.getPhonebooks(phonebookPage, phonebookPageSize),
  });

  const { data: userInfoResponse } = useQuery({
    queryKey: ["userInfo"],
    queryFn: Contact.getUserInfo,
  });

  // Extract data
  const contacts = contactsResponse?.data || [];
  const phonebooks = phonebooksResponse?.data || [];
  const phonebookPagination = phonebooksResponse?.pagination;
  const userInfo = userInfoResponse?.data;

  // Initialize allPhonebooks
  useEffect(() => {
    if (phonebooks.length > 0 && phonebookPage === 1) {
      setAllPhonebooks(phonebooks);
    }
  }, [phonebooks, phonebookPage]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showTagDropdown && !target.closest(".tag-dropdown-container")) {
        setShowTagDropdown(false);
        setTagSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTagDropdown]);

  // Filter contacts with useMemo for performance
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact: any) => {
      if (
        selectedPhonebook !== "all" &&
        contact.phonebook_id?.toString() !== selectedPhonebook
      )
        return false;
      if (!debouncedSearchTerm) return true;

      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.phone?.includes(debouncedSearchTerm) ||
        contact.mobile?.includes(debouncedSearchTerm) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.first_name?.toLowerCase().includes(searchLower) ||
        contact.last_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [contacts, selectedPhonebook, debouncedSearchTerm]);

  // Pagination with useMemo for performance
  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredContacts.length / pageSize);
    
    return {
      startIndex,
      endIndex,
      paginatedContacts,
      totalPages
    };
  }, [filteredContacts, currentPage, pageSize]);

  const { startIndex, endIndex, paginatedContacts, totalPages } = paginationData;

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedPhonebook]);

  const loadMorePhonebooks = async () => {
    if (phonebookPagination && phonebookPage < phonebookPagination.totalPages) {
      const nextPage = phonebookPage + 1;
      setPhonebookPage(nextPage);
      try {
        const nextPageResponse = await Contact.getPhonebooks(
          nextPage,
          phonebookPageSize
        );
        if (nextPageResponse.success && nextPageResponse.data) {
          setAllPhonebooks((prev) => [...prev, ...nextPageResponse.data]);
          toast({
            title: "Success",
            description: `Loaded ${nextPageResponse.data.length} more phonebooks`,
            variant: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load more phonebooks",
          variant: "destructive",
        });
      }
    }
  };

  const showAllPhonebooks = async () => {
    if (phonebookPagination && phonebookPagination.totalPages > 1) {
      try {
        const allPhonebooksData = [...phonebooks];
        for (let page = 2; page <= phonebookPagination.totalPages; page++) {
          const response = await Contact.getPhonebooks(page, phonebookPageSize);
          if (response.success && response.data)
            allPhonebooksData.push(...response.data);
        }
        setAllPhonebooks(allPhonebooksData);
        setShowAllTags(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load all phonebooks",
          variant: "destructive",
        });
      }
    } else {
      setShowAllTags(true);
    }
  };

  const displayPhonebooks = useMemo(() => 
    showAllTags ? allPhonebooks : phonebooks, 
    [showAllTags, allPhonebooks, phonebooks]
  );
  
  const filteredTags = useMemo(() => 
    displayPhonebooks.filter((phonebook: any) =>
      phonebook.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    ), 
    [displayPhonebooks, tagSearchTerm]
  );

  const addContactMutation = useMutation({
    mutationFn: Contact.addContact,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contact added successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setAddContactModal(false);
      setContactForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        gender: "",
      });
      setTagSearchTerm("");
      setShowTagDropdown(false);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const addPhonebookMutation = useMutation({
    mutationFn: Contact.addPhonebook,
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: "Phonebook created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["phonebooks"] });
      setAddPhonebookModal(false);
      setPhonebookForm({ name: "" });
      if (data.data?.id) setSelectedPhonebook(data.data.id.toString());
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const deleteContactsMutation = useMutation({
    mutationFn: Contact.deleteContacts,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contacts deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedContacts([]);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const reassignContactsMutation = useMutation({
    mutationFn: ({
      contactIds,
      newPhonebookId,
    }: {
      contactIds: number[];
      newPhonebookId: number;
    }) => Contact.reassignContactsToPhonebook(contactIds, newPhonebookId),
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Successfully reassigned ${data.data.updatedContacts} contacts to ${data.data.newPhonebookName}`,
        variant: "success",
      });
      // Refresh all related data
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["phonebooks"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      setSelectedContacts([]);
      setReassignModal(false);
      setTargetPhonebookForReassign("");
      // Reset to first page after reassignment
      setCurrentPage(1);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handleAddContact = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const phonebookId =
      selectedPhonebook !== "all"
        ? selectedPhonebook
        : userInfo?.phonebook_id || "1";
    const payload = {
      mobile: contactForm.phone.trim(),
      name: contactForm.last_name.trim()
        ? `${contactForm.first_name.trim()} ${contactForm.last_name.trim()}`.trim()
        : contactForm.first_name.trim(),
      email: contactForm.email.trim() || null,
      gender: contactForm.gender,
      source: "Manual",
      id: phonebookId.toString(),
    };
    addContactMutation.mutate(payload);
  }, [selectedPhonebook, userInfo?.phonebook_id, contactForm, addContactMutation]);

  const handleAddPhonebook = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    addPhonebookMutation.mutate({ name: phonebookForm.name });
  }, [phonebookForm.name, addPhonebookMutation]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedContacts.length > 0)
      deleteContactsMutation.mutate({ selected: selectedContacts });
  }, [selectedContacts, deleteContactsMutation]);

  const handleAssignedToChange = useCallback((contactId: string, value: string) => {
    setAssignedTo((prev) => ({ ...prev, [contactId]: value }));
    toast({
      title: "Success",
      description: `Contact assigned to ${value}`,
      variant: "success",
    });
  }, [toast]);

  const getContactCount = useCallback((phonebookId: string) => {
    if (phonebookId === "all") return contacts.length;
    return contacts.filter(
      (c: any) => c.phonebook_id?.toString() === phonebookId
    ).length;
  }, [contacts]);

  const handleAssignToTag = useCallback((contactId: string) => {
    setSelectedContacts([contactId]);
    setReassignModal(true);
  }, []);

  // Auto-refresh data after reassignment
  useEffect(() => {
    if (reassignContactsMutation.isSuccess) {
      // Refresh contacts data
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      // Refresh phonebooks data
      queryClient.invalidateQueries({ queryKey: ["phonebooks"] });
    }
  }, [reassignContactsMutation.isSuccess, queryClient]);

  const shouldShowMoreButton = useMemo(() =>
    phonebookPagination && phonebookPagination.totalItems > 10,
    [phonebookPagination]
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0 rounded-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-end gap-3">
            <div className="relative">
              <div className="p-2.5 text-blue-600 cursor-help group rounded-lg transition-all duration-200">
                <Info className="h-4 w-4" />
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-lg text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-80 pointer-events-none">
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                  <div className="px-2 py-3">
                    <div className="text-gray-700 text-xs leading-relaxed">
                      Organize your contacts with custom tags and manage them
                      efficiently. Create, import, and organize contacts by
                      purpose, priority, or any criteria.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setAddContactModal(true)}
              size="sm"
              className="h-10 px-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>

            <div className="relative">
              <Button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-gray-100 border border-gray-200"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>

              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setAddPhonebookModal(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Tag
                    </button>
                    <button
                      onClick={() => {
                        setImportModal(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      Import Contacts
                    </button>
                    <button
                      onClick={() => {
                        setReassignModal(true);
                        setShowOptionsMenu(false);
                      }}
                      disabled={selectedContacts.length === 0}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded-md flex items-center gap-2 text-green-700 disabled:opacity-50"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Reassign to Tag ({selectedContacts.length})
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        handleDeleteSelected();
                        setShowOptionsMenu(false);
                      }}
                      disabled={selectedContacts.length === 0}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded-md flex items-center gap-2 text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedContacts.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Tags Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Tags</h3>

            {phonebooksLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* All Contacts Tag */}
                <motion.button
                  onClick={() => setSelectedPhonebook("all")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    selectedPhonebook === "all"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">All Contacts</span>
                  <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {getContactCount("all")}
                  </span>
                </motion.button>

                {/* Individual Tags */}
                {displayPhonebooks.map((phonebook: any) => (
                  <motion.button
                    key={phonebook.id}
                    onClick={() =>
                      setSelectedPhonebook(phonebook.id.toString())
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                      selectedPhonebook === phonebook.id.toString()
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">
                      {phonebook.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                      {getContactCount(phonebook.id.toString())}
                    </span>
                    {selectedPhonebook === phonebook.id.toString() && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </motion.button>
                ))}

                {/* Show All Button */}
                {!showAllTags &&
                  shouldShowMoreButton &&
                  phonebookPagination &&
                  phonebookPagination.totalPages > 1 && (
                    <motion.button
                      onClick={() => showAllPhonebooks()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm font-medium">
                        Show All ({phonebookPagination.totalItems - 10} more)
                      </span>
                    </motion.button>
                  )}

                {/* Show Less Button */}
                {showAllTags && shouldShowMoreButton && (
                  <motion.button
                    onClick={() => setShowAllTags(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium">Show Less</span>
                  </motion.button>
                )}

                {/* Create Tag Button */}
                <motion.button
                  onClick={() => setAddPhonebookModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">Create Tag</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-10"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Show dropdown for page size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        paginatedContacts.length > 0 &&
                        selectedContacts.length === paginatedContacts.length
                      }
                      onChange={(e) =>
                        setSelectedContacts(
                          e.target.checked
                            ? paginatedContacts.map((c: any) => c.id)
                            : []
                        )
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Contact Info
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Phone
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Tag
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Ad Source
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Assigned To
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-700">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : paginatedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-12">
                      <div className="text-gray-600 font-medium mb-1">
                        No contacts found
                      </div>
                      <div className="text-gray-500 text-sm">
                        Try adjusting your search criteria
                      </div>
                    </td>
                  </tr>
                                 ) : (
                                       paginatedContacts.map((contact: any) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        selectedContacts={selectedContacts}
                        setSelectedContacts={setSelectedContacts}
                        displayPhonebooks={displayPhonebooks}
                        assignedTo={assignedTo}
                        handleAssignedToChange={handleAssignedToChange}
                        onAssignToTag={handleAssignToTag}
                      />
                    ))
                 )}
              </tbody>
            </table>
          </div>

          {/* Contact Count and Pagination */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {startIndex + 1}-{Math.min(endIndex, filteredContacts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filteredContacts.length}</span>{" "}
                contacts
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      {addContactModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
                         <div className="flex items-center justify-between mb-3">
               <h2 className="text-lg font-semibold text-gray-900">
                 Add New Contact
               </h2>
              <button
                onClick={() => {
                  setAddContactModal(false);
                  setTagSearchTerm("");
                  setShowTagDropdown(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              {/* First Name */}
              <div>
                                 <label
                   htmlFor="firstName"
                   className="block text-xs font-medium text-gray-700 mb-1"
                 >
                   First Name <span className="text-red-500">*</span>
                 </label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  required
                  value={contactForm.first_name}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                                 <label
                   htmlFor="lastName"
                   className="block text-xs font-medium text-gray-700 mb-1"
                 >
                   Last Name
                 </label>
                <Input
                  id="lastName"
                  placeholder="Enter last name (optional)"
                  value={contactForm.last_name}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                                     <label
                     htmlFor="phone"
                     className="block text-xs font-medium text-gray-700"
                   >
                     Phone Number <span className="text-red-500">*</span>
                   </label>
                  <div className="relative group">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 shadow-lg text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64 pointer-events-none">
                      <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                      <div className="px-3 py-2">
                        <div className="text-gray-700 text-xs leading-relaxed">
                          Enter a valid phone number (e.g., +91 98765 43210).
                          Phone number should be unique and properly formatted.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  pattern="[0-9+\-\s()]+"
                />
              </div>

              {/* Email */}
              <div>
                                 <label
                   htmlFor="email"
                   className="block text-xs font-medium text-gray-700 mb-1"
                 >
                   Email Address
                 </label>
                <Input
                  id="email"
                  placeholder="Enter email address (optional)"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Gender */}
              <div>
                                 <label
                   htmlFor="gender"
                   className="block text-xs font-medium text-gray-700 mb-1"
                 >
                   Gender
                 </label>
                <Select
                  value={contactForm.gender}
                  onValueChange={(value) =>
                    setContactForm((prev) => ({ ...prev, gender: value }))
                  }
                >
                                     <SelectTrigger className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                     <SelectValue placeholder="Select gender" />
                   </SelectTrigger>
                  <SelectContent className="z-[10000] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Selection */}
              <div>
                                 <label
                   htmlFor="tag"
                   className="block text-xs font-medium text-gray-700 mb-1"
                 >
                   Assign to Tag <span className="text-red-500">*</span>
                 </label>

                {/* Custom Searchable Dropdown */}
                <div className="relative tag-dropdown-container">
                                     <div
                     onClick={() => setShowTagDropdown(!showTagDropdown)}
                     className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 flex items-center justify-between"
                   >
                    <span
                      className={
                        selectedPhonebook !== "all"
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {selectedPhonebook !== "all"
                        ? displayPhonebooks.find(
                            (p) => p.id.toString() === selectedPhonebook
                          )?.name || "Select a tag"
                        : "Select a tag for this contact"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {showTagDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-[10000] max-h-60 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100">
                        <Input
                          placeholder="Search tags..."
                          value={tagSearchTerm}
                          onChange={(e) => setTagSearchTerm(e.target.value)}
                          className="w-full"
                          autoFocus
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-48 overflow-y-auto">
                        {/* All Contacts Option */}
                        <div
                          onClick={() => {
                            setSelectedPhonebook("all");
                            setShowTagDropdown(false);
                            setTagSearchTerm("");
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-600">
                              All Contacts
                            </span>
                          </div>
                        </div>

                        {/* Filtered Tags */}
                        {filteredTags.map((phonebook: any) => (
                          <div
                            key={phonebook.id}
                            onClick={() => {
                              setSelectedPhonebook(phonebook.id.toString());
                              setShowTagDropdown(false);
                              setTagSearchTerm("");
                            }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-900">
                                {phonebook.name}
                              </span>
                            </div>
                          </div>
                        ))}

                        {filteredTags.length === 0 && tagSearchTerm && (
                          <div className="px-3 py-2 text-gray-500 text-sm text-center">
                            No tags found matching "{tagSearchTerm}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddContactModal(false);
                    setTagSearchTerm("");
                    setShowTagDropdown(false);
                  }}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addContactMutation.isPending ||
                    !contactForm.first_name.trim() ||
                    !contactForm.phone.trim()
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700"
                >
                  {addContactMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Phonebook Modal */}
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
               <h2 className="text-lg font-semibold text-gray-900">
                 Create New Tag
               </h2>
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tag Organization Tips:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>
                        • Use clear, descriptive names (e.g., "VIP Customers",
                        "Follow-up Required")
                      </li>
                      <li>
                        • Keep names under 50 characters for better display
                      </li>
                      <li>
                        • Tags help organize contacts by purpose, priority, or
                        status
                      </li>
                    </ul>
                  </div>
                </div>
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

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl w-96 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Import Contacts</h2>
            <p className="text-gray-600 mb-4">
              CSV import functionality coming soon...
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setImportModal(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reassign Contacts Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl w-[500px] max-w-[90vw] relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
                         <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-semibold text-gray-900">
                 Reassign Contacts to Tag
               </h2>
              <button
                onClick={() => {
                  setReassignModal(false);
                  setTargetPhonebookForReassign("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Selected Contacts Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Selected Contacts:</p>
                    <p className="text-blue-700">
                      {selectedContacts.length} contact
                      {selectedContacts.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Tag Selection */}
              <div>
                                 <label className="block text-xs font-medium text-gray-700 mb-2">
                   Select Target Tag <span className="text-red-500">*</span>
                 </label>
                <Select
                  value={targetPhonebookForReassign}
                  onValueChange={(value) =>
                    setTargetPhonebookForReassign(value)
                  }
                >
                                     <SelectTrigger className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                     <SelectValue placeholder="Choose a tag to reassign contacts to..." />
                   </SelectTrigger>
                  <SelectContent className="z-[10000] bg-white border border-gray-200 shadow-lg">
                    {displayPhonebooks.map((phonebook: any) => (
                      <SelectItem
                        key={phonebook.id}
                        value={phonebook.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-gray-600" />
                          <span>{phonebook.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReassignModal(false);
                    setTargetPhonebookForReassign("");
                  }}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (targetPhonebookForReassign) {
                      reassignContactsMutation.mutate({
                        contactIds: selectedContacts.map((id) => Number(id)),
                        newPhonebookId: Number(targetPhonebookForReassign),
                      });
                    } else {
                      toast({
                        title: "Error",
                        description:
                          "Please select a specific tag to reassign contacts to",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={
                    reassignContactsMutation.isPending ||
                    !targetPhonebookForReassign ||
                    selectedContacts.length === 0
                  }
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700"
                >
                  {reassignContactsMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Reassigning...
                    </div>
                  ) : (
                    "Reassign Contacts"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
