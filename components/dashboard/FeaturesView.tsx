import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import serverHandler from '@/utils/serverHandler';

const ICONS = [
  '/placeholder-logo.svg',
  '/placeholder-logo.png',
  '/placeholder-user.jpg',
  '/placeholder.jpg',
  '/placeholder.svg',
];
const POSITIONS = [
  { value: 'BOTTOM_RIGHT', label: 'Bottom Right' },
  { value: 'BOTTOM_LEFT', label: 'Bottom Left' },
  { value: 'TOP_RIGHT', label: 'Top Right' },
  { value: 'TOP_LEFT', label: 'Top Left' },
  { value: 'CENTER', label: 'Center' },
];

export default function FeaturesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    whatsapp_number: '',
    place: 'BOTTOM_RIGHT',
    selectedIcon: ICONS[0],
    logoType: 'SELECT',
    size: 64,
    file: null as File | null,
  });
  const [previewIcon, setPreviewIcon] = useState(ICONS[0]);
  const [copyEmbedId, setCopyEmbedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List widgets
  const { data: widgets, isLoading, error } = useQuery({
    queryKey: ['widgets'],
    queryFn: async () => {
      const res = await serverHandler.get('/api/user/get_my_widget');
      if (!res.data.success) throw new Error(res.data.msg || 'Failed to fetch widgets');
      return res.data.data;
    },
    gcTime: 5 * 60 * 1000,
  });

  // Add widget
  const addWidgetMutation = useMutation({
    mutationFn: async (payload: any) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'file' && v) formData.append('file', v);
        else if (v !== undefined && v !== null) formData.append(k, v as any);
      });
      const res = await serverHandler.post('/api/user/add_widget', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Widget created', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
        setShowAddModal(false);
        setForm({ title: '', whatsapp_number: '', place: 'BOTTOM_RIGHT', selectedIcon: ICONS[0], logoType: 'SELECT', size: 64, file: null });
        setPreviewIcon(ICONS[0]);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Delete widget
  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await serverHandler.post('/api/user/del_widget', { id });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Widget deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Copy embed code
  async function handleCopyEmbed(unique_id: string) {
    try {
      const res = await serverHandler.get(`/api/user/widget?id=${unique_id}`);
      await navigator.clipboard.writeText(res.data);
      toast({ title: 'Copied!', description: 'Embed code copied to clipboard', variant: 'default' });
      setCopyEmbedId(unique_id);
      setTimeout(() => setCopyEmbedId(null), 1500);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // Handle icon selection/upload
  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, logoType: 'UPLOAD', file: e.target.files![0] }));
      setPreviewIcon(URL.createObjectURL(e.target.files[0]));
    }
  }

  // Add widget form submit
  function handleAddWidget(e: any) {
    e.preventDefault();
    const payload = { ...form };
    if (form.logoType === 'SELECT') payload.file = undefined;
    addWidgetMutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-puzzle-piece mr-2 text-blue-600"></i>
              Chat Widgets
            </CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus mr-2"></i>
              Add Widget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading widgets...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Title</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">WhatsApp</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Icon</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Position</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Size</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Embed</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {widgets && widgets.length > 0 ? widgets.map((w: any) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{w.title}</td>
                      <td className="border border-gray-200 px-4 py-2">{w.whatsapp_number}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <img src={w.logo} alt="icon" className="h-10 w-10 rounded" />
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{w.place}</td>
                      <td className="border border-gray-200 px-4 py-2">{w.size}px</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Button size="sm" onClick={() => handleCopyEmbed(w.unique_id)}>
                          {copyEmbedId === w.unique_id ? 'Copied!' : 'Copy Embed'}
                        </Button>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Button size="sm" variant="destructive" onClick={() => deleteWidgetMutation.mutate(w.id)}>
                          <i className="fas fa-trash mr-1"></i>Delete
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="text-center py-8">No widgets found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add Widget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleAddWidget} className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Add Widget</h2>
            <Input name="title" placeholder="Widget Title" required className="mb-2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input name="whatsapp_number" placeholder="WhatsApp Number" required className="mb-2" value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} />
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Widget Position</label>
              <select className="w-full border rounded px-2 py-1" value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))}>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Widget Size (px)</label>
              <Input type="number" name="size" min={32} max={128} value={form.size} onChange={e => setForm(f => ({ ...f, size: Number(e.target.value) }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex gap-2 mb-2">
                {ICONS.map(icon => (
                  <button type="button" key={icon} className={`border rounded p-1 ${form.selectedIcon === icon && form.logoType === 'SELECT' ? 'border-blue-500' : 'border-gray-200'}`} onClick={() => { setForm(f => ({ ...f, selectedIcon: icon, logoType: 'SELECT', file: null })); setPreviewIcon(icon); }}>
                    <img src={icon} alt="icon" className="h-8 w-8" />
                  </button>
                ))}
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleIconChange} />
                <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} variant={form.logoType === 'UPLOAD' ? 'default' : 'outline'}>Upload</Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <img src={previewIcon} alt="preview" className="h-8 w-8 rounded" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Add</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 