"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import serverHandler from '@/utils/serverHandler';

export default function BroadcastView() {
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: 'marketing',
    language: 'English',
    body: '',
    footer: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['meta-templates'],
    queryFn: async () => {
      const res = await serverHandler.get('/api/user/get_my_meta_templets');
      if (!(res.data as any).success) throw new Error((res.data as any).msg || 'Failed to fetch templates');
      return (res.data as any).data;
    },
    gcTime: 5 * 60 * 1000,
  });

  // Add template
  const addTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await serverHandler.post('/api/user/add_meta_templet', payload);
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Template created', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['meta-templates'] });
        setShowTemplateForm(false);
        setForm({ name: '', category: 'marketing', language: 'English', body: '', footer: '' });
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await serverHandler.post('/api/user/del_meta_templet', { name });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Template deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['meta-templates'] });
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  function handleAddTemplate(e: any) {
    e.preventDefault();
    const payload = {
      name: form.name.replace(/\s+/g, '_'),
      category: form.category,
      language: form.language,
      components: [
        { type: 'BODY', text: form.body, example: null },
        ...(form.footer ? [{ type: 'FOOTER', text: form.footer }] : [])
      ]
    };
    addTemplateMutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-broadcast-tower mr-2 text-blue-600"></i>
              Broadcast
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-cog mr-2"></i>
                Manage Meta Template
              </Button>
              <Button onClick={() => setShowTemplateForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="fas fa-plus mr-2"></i>
                Add New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Language</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading templates...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="text-center text-red-500 py-8">{error.message}</td></tr>
                ) : templates && templates.length > 0 ? templates.map((t: any) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2">{t.id}</td>
                    <td className="border border-gray-200 px-4 py-2">{t.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{t.language}</td>
                    <td className="border border-gray-200 px-4 py-2">{t.category}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {t.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <i className="fas fa-paper-plane mr-1"></i>
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => deleteTemplateMutation.mutate(t.name)}
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan={6} className="text-center py-8">No templates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">{templates && templates.length > 0 ? `Showing 1 to ${templates.length} of ${templates.length} entries` : 'No entries'}</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showTemplateForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTemplate}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        <option value="marketing">Marketing</option>
                        <option value="utility">Utility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.language}
                        onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Title (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter broadcast title"
                      // Not used in API, but kept for UI
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Use dynamic variables like {{1}} {{2}} and so on"
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer (Optional)</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Footers are great to add any disclaimers or to add a thoughtful PS"
                      value={form.footer}
                      onChange={e => setForm(f => ({ ...f, footer: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buttons (Optional)</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="none" className="mr-2" defaultChecked />
                      None
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="cta" className="mr-2" />
                      Call to Action
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="quick" className="mr-2" />
                      Quick Reply
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Template</Button>
                    <Button type="button" variant="outline" onClick={() => setShowTemplateForm(false)} className="border-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm border max-w-sm min-h-[80px] flex flex-col justify-center">
                  <div className="bg-green-500 text-white p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-line min-h-[32px]">{form.body.trim() ? form.body : 'Your message preview will appear here...'}</p>
                      {form.footer.trim() && <div className="text-xs mt-2">{form.footer}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
