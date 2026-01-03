"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    catalog_id: "",
    platform: "whatsapp",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCatalogs()
  }, [])

  const fetchCatalogs = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getCatalogs()
      console.log("📦 Fetched catalogs:", data)
      setCatalogs(data || [])
    } catch (error) {
      console.error("Failed to fetch catalogs:", error)
      setCatalogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleConnectCatalog = () => {
    setShowDialog(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.catalog_id) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      // Trim whitespace from inputs
      const result = await ecommerceApi.createCatalog({
        name: formData.name.trim(),
        catalog_id: formData.catalog_id.trim(),
        platform: formData.platform.trim() || "whatsapp",
      })
      
      console.log("✅ Catalog created/retrieved:", result)
      
      // Check if catalog was already connected (existing catalog returned)
      if (result && result.id) {
        toast({ 
          title: "Catalog connected successfully!", 
          description: catalogs.some(c => c.id === result.id) 
            ? "Catalog was already connected" 
            : "New catalog connected",
          variant: "default" 
        })
      } else {
        toast({ title: "Catalog connected successfully!", variant: "default" })
      }
      
      setShowDialog(false)
      setFormData({ name: "", catalog_id: "", platform: "whatsapp" })
      // Refresh catalogs list
      await fetchCatalogs()
    } catch (error: any) {
      console.error("Failed to connect catalog:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.msg || 
                          error?.message || 
                          "Please try again"
      
      // If catalog already exists, still refresh the list
      if (errorMessage.includes("already exists")) {
        toast({ 
          title: "Catalog already connected", 
          description: "This catalog is already in your list",
          variant: "default" 
        })
        await fetchCatalogs()
      } else {
        toast({ 
          title: "Failed to connect catalog", 
          description: errorMessage,
          variant: "destructive" 
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
        <p className="text-gray-600">Manage your WhatsApp storefront, catalogs, products and orders.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Catalogs</h2>
        <p className="text-sm text-gray-600 mb-4">View the catalog connected to your WhatsApp Business Account.</p>

        {loading ? (
          <div className="text-center py-8">Loading catalogs...</div>
        ) : catalogs.length === 0 ? (
          <Card className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-700 mb-4">
              No catalog is connected to this WhatsApp Business Account yet. Connect a catalog to start selling on WhatsApp.
            </p>
            <Button
              onClick={handleConnectCatalog}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2"
            >
              Connect catalog
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {catalogs.map((catalog) => (
              <Card key={catalog.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{catalog.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Catalog ID: {catalog.catalog_id}</p>
                    <p className="text-xs text-gray-500 mt-1">Platform: {catalog.platform}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      catalog.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {catalog.status}
                    </span>
                    <Button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this catalog?")) {
                          try {
                            await ecommerceApi.deleteCatalog(catalog.id)
                            toast({ title: "Catalog deleted", variant: "default" })
                            fetchCatalogs()
                          } catch (error: any) {
                            toast({ title: "Failed to delete catalog", variant: "destructive" })
                          }
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Connect Catalog Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Catalog</DialogTitle>
            <DialogDescription>
              Enter your catalog details to connect it to your WhatsApp Business Account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Catalog Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="My Product Catalog"
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="catalog_id">Catalog ID *</Label>
                <Input
                  id="catalog_id"
                  name="catalog_id"
                  value={formData.catalog_id}
                  onChange={handleInputChange}
                  placeholder="Enter your Meta Catalog ID"
                  required
                  className="rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can find your Catalog ID in your Meta Business Manager or WhatsApp Business settings.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  placeholder="whatsapp"
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setFormData({ name: "", catalog_id: "", platform: "whatsapp" })
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={submitting}
              >
                {submitting ? "Connecting..." : "Connect Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
