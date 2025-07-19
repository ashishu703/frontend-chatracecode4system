"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import serverHandler from '@/utils/serverHandler';

export default function PhonebookView() {
  const [selectedPhonebook, setSelectedPhonebook] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addPhonebookModal, setAddPhonebookModal] = useState(false);
  const [addContactModal, setAddContactModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [deletePhonebookId, setDeletePhonebookId] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all phonebooks
  const { data: phonebooks, isLoading: phonebooksLoading, error: phonebooksError } = useQuery({
    queryKey: ['phonebooks'],
    queryFn: async () => {
      const res = await serverHandler.get('/api/phonebook/get_by_uid');
      if (!res.data.success) throw new Error(res.data.msg || 'Failed to fetch phonebooks');
      return res.data.data;
    },
    gcTime: 5 * 60 * 1000,
  });

  // Select first phonebook by default
  useEffect(() => {
    if (phonebooks && phonebooks.length > 0 && !selectedPhonebook) {
      setSelectedPhonebook(phonebooks[0].id);
    }
  }, [phonebooks, selectedPhonebook]);

  // Fetch all contacts
  const { data: contacts, isLoading: contactsLoading, error: contactsError } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await serverHandler.get('/api/phonebook/get_uid_contacts');
      if (!res.data.success) throw new Error(res.data.msg || 'Failed to fetch contacts');
      return res.data.data;
    },
    gcTime: 5 * 60 * 1000,
  });

  // Filter contacts by selected phonebook
  const filteredContacts = (contacts || []).filter((c: any) => !selectedPhonebook || c.phonebook_name === (phonebooks?.find((pb: any) => pb.id === selectedPhonebook)?.name));
  const displayedContacts = searchTerm
    ? filteredContacts.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm))
    : filteredContacts;

  // Add Phonebook
  const addPhonebookMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await serverHandler.post('/api/phonebook/add', { name });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Phonebook added', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['phonebooks'] });
        setAddPhonebookModal(false);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Add Contact
  const addContactMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await serverHandler.post('/api/phonebook/add_single_contact', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Contact added', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        setAddContactModal(false);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Import Contacts
  const importContactsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await serverHandler.post('/api/phonebook/import_contacts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Contacts imported', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        setImportModal(false);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Delete Contacts
  const deleteContactsMutation = useMutation({
    mutationFn: async (selected: string[]) => {
      const res = await serverHandler.post('/api/phonebook/del_contacts', { selected });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Contacts deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        setSelectedContacts([]);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Delete Phonebook
  const deletePhonebookMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await serverHandler.post('/api/phonebook/del_phonebook', { id });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Phonebook deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['phonebooks'] });
        setDeletePhonebookId(null);
        setSelectedPhonebook(null);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Handlers for forms
  function handleAddPhonebook(e: any) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (name) addPhonebookMutation.mutate(name);
  }
  function handleAddContact(e: any) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      id: selectedPhonebook,
      name: form.name.value.trim(),
      mobile: form.mobile.value.trim(),
      phonebook_name: phonebooks?.find((pb: any) => pb.id === selectedPhonebook)?.name || '',
      var1: form.var1.value.trim(),
      var2: form.var2.value.trim(),
      var3: form.var3.value.trim(),
      var4: form.var4.value.trim(),
      var5: form.var5.value.trim(),
    };
    addContactMutation.mutate(payload);
  }
  function handleImportContacts(e: any) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !selectedPhonebook) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', selectedPhonebook);
    formData.append('phonebook_name', phonebooks?.find((pb: any) => pb.id === selectedPhonebook)?.name || '');
    importContactsMutation.mutate(formData);
  }

  // UI
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-address-book mr-2 text-blue-600"></i>
              Phonebook
            </CardTitle>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAddPhonebookModal(true)} disabled={phonebooksLoading}>
              <i className="fas fa-plus mr-2"></i>
              Add Phonebook
            </Button>
              {selectedPhonebook && (
                <Button variant="destructive" onClick={() => setDeletePhonebookId(selectedPhonebook)}>
                  <i className="fas fa-trash mr-2"></i>
                  Delete Phonebook
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {phonebooksLoading ? (
            <div className="py-8 text-center">Loading phonebooks...</div>
          ) : phonebooksError ? (
            <div className="py-8 text-center text-red-500">{phonebooksError.message}</div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {phonebooks && phonebooks.length > 0 ? (
                phonebooks.map((pb: any) => (
                  <Button
                    key={pb.id}
                    variant={selectedPhonebook === pb.id ? 'default' : 'outline'}
                    className="capitalize"
                    onClick={() => setSelectedPhonebook(pb.id)}
                  >
                    {pb.name}
                  </Button>
                ))
              ) : (
                <div className="text-gray-500">No phonebooks found.</div>
              )}
            </div>
          )}
          {/* Contacts Table */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={() => setAddContactModal(true)} disabled={!selectedPhonebook}>
                <i className="fas fa-user-plus mr-2"></i>
                Add Contact
              </Button>
              <Button onClick={() => setImportModal(true)} disabled={!selectedPhonebook}>
                <i className="fas fa-file-csv mr-2"></i>
                Import Contacts
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteContactsMutation.mutate(selectedContacts)}
                disabled={selectedContacts.length === 0}
              >
                <i className="fas fa-trash mr-2"></i>
                Delete Selected
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={displayedContacts.length > 0 && selectedContacts.length === displayedContacts.length}
                      onChange={e => setSelectedContacts(e.target.checked ? displayedContacts.map((c: any) => c.id) : [])}
                    />
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Phone No</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable1</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable2</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable3</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable4</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable5</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {contactsLoading ? (
                  <tr><td colSpan={9} className="text-center py-8">Loading contacts...</td></tr>
                ) : contactsError ? (
                  <tr><td colSpan={9} className="text-center text-red-500 py-8">{contactsError.message}</td></tr>
                ) : displayedContacts.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8">No contacts found.</td></tr>
                ) : (
                  displayedContacts.map((contact: any) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                      <td className="border border-gray-200 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={e => setSelectedContacts(e.target.checked ? [...selectedContacts, contact.id] : selectedContacts.filter(id => id !== contact.id))}
                        />
                      </td>
                    <td className="border border-gray-200 px-4 py-2">{contact.name}</td>
                      <td className="border border-gray-200 px-4 py-2">{contact.mobile}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var1}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var2}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var3}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var4}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var5}</td>
                      <td className="border border-gray-200 px-4 py-2">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Add Phonebook Modal */}
      {addPhonebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleAddPhonebook} className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Add Phonebook</h2>
            <Input name="name" placeholder="Phonebook Name" required className="mb-4" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddPhonebookModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Add</Button>
            </div>
          </form>
        </div>
      )}
      {/* Add Contact Modal */}
      {addContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleAddContact} className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Add Contact</h2>
            <Input name="name" placeholder="Name" required className="mb-2" />
            <Input name="mobile" placeholder="Phone Number" required className="mb-2" />
            <Input name="var1" placeholder="Variable 1" className="mb-2" />
            <Input name="var2" placeholder="Variable 2" className="mb-2" />
            <Input name="var3" placeholder="Variable 3" className="mb-2" />
            <Input name="var4" placeholder="Variable 4" className="mb-2" />
            <Input name="var5" placeholder="Variable 5" className="mb-2" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddContactModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Add</Button>
            </div>
          </form>
        </div>
      )}
      {/* Import Contacts Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleImportContacts} className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Import Contacts (CSV)</h2>
            <input ref={fileInputRef} type="file" accept=".csv" required className="mb-4" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setImportModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Import</Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">CSV Format: name,mobile,var1,var2,var3,var4,var5</div>
          </form>
        </div>
      )}
      {/* Delete Phonebook Modal */}
      {deletePhonebookId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Delete Phonebook</h2>
            <p>Are you sure you want to delete this phonebook? All contacts in it will be deleted.</p>
            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setDeletePhonebookId(null)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={() => deletePhonebookMutation.mutate(deletePhonebookId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
