"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Plus, Edit, Trash2 } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "INR",
    retailer_id: "",
    availability: "in stock",
    condition: "new",
    brand: "",
    category: "",
    inventory: "",
    image_url: "",
    url: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCatalogs()
  }, [])

  useEffect(() => {
    if (catalogs.length > 0 && !selectedCatalogId) {
      setSelectedCatalogId(catalogs[0].id.toString())
    }
  }, [catalogs])

  useEffect(() => {
    if (selectedCatalogId) {
      fetchProducts(selectedCatalogId)
    }
  }, [selectedCatalogId])

  const fetchCatalogs = async () => {
    try {
      const data = await ecommerceApi.getCatalogs()
      setCatalogs(data || [])
      if (data && data.length > 0 && !selectedCatalogId) {
        setSelectedCatalogId(data[0].id.toString())
      }
    } catch (error) {
      console.error("Failed to fetch catalogs:", error)
    }
  }

  const fetchProducts = async (catalogId?: string) => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getProducts(catalogId || selectedCatalogId || undefined)
      setProducts(data || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProducts = async () => {
    if (!selectedCatalogId) {
      toast({ title: "Please select a catalog first", variant: "destructive" })
      return
    }

    try {
      setSyncing(true)
      await ecommerceApi.syncProducts(selectedCatalogId)
      toast({ title: "Products synced successfully!", variant: "default" })
      await fetchProducts(selectedCatalogId)
    } catch (error: any) {
      console.error("Failed to sync products:", error)
      toast({ 
        title: "Failed to sync products", 
        description: error?.response?.data?.message || error.message || "Please try again",
        variant: "destructive" 
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateProduct = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "INR",
      retailer_id: "",
      availability: "in stock",
      condition: "new",
      brand: "",
      category: "",
      inventory: "",
      image_url: "",
      url: "",
    })
    setShowCreateDialog(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      currency: product.currency || "INR",
      retailer_id: product.retailer_id || "",
      availability: product.availability || "in stock",
      condition: product.condition || "new",
      brand: product.brand || "",
      category: product.category || "",
      inventory: product.inventory?.toString() || "",
      image_url: product.image_url || "",
      url: product.url || "",
    })
    setShowEditDialog(true)
  }

  const handleDeleteProduct = async (product: any) => {
    if (!selectedCatalogId) return
    
    if (!confirm(`Are you sure you want to delete "${product.name}"? This will also delete it from Meta catalog.`)) {
      return
    }

    try {
      await ecommerceApi.deleteProduct(selectedCatalogId, product.id.toString())
      toast({ title: "Product deleted successfully", variant: "default" })
      await fetchProducts(selectedCatalogId)
    } catch (error: any) {
      console.error("Failed to delete product:", error)
      toast({ 
        title: "Failed to delete product", 
        description: error?.response?.data?.message || error.message || "Please try again",
        variant: "destructive" 
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitCreate = async () => {
    if (!selectedCatalogId) {
      toast({ title: "Please select a catalog first", variant: "destructive" })
      return
    }

    if (!formData.name || !formData.price) {
      toast({ title: "Name and price are required", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      await ecommerceApi.createProduct(selectedCatalogId, {
        ...formData,
        price: parseFloat(formData.price),
        inventory: formData.inventory ? parseInt(formData.inventory) : 0,
      })
      toast({ title: "Product created successfully!", variant: "default" })
      setShowCreateDialog(false)
      await fetchProducts(selectedCatalogId)
    } catch (error: any) {
      console.error("Failed to create product:", error)
      toast({ 
        title: "Failed to create product", 
        description: error?.response?.data?.message || error.message || "Please try again",
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedCatalogId || !editingProduct) return

    try {
      setSubmitting(true)
      await ecommerceApi.updateProduct(selectedCatalogId, editingProduct.id.toString(), {
        ...formData,
        price: parseFloat(formData.price),
        inventory: formData.inventory ? parseInt(formData.inventory) : 0,
      })
      toast({ title: "Product updated successfully!", variant: "default" })
      setShowEditDialog(false)
      setEditingProduct(null)
      await fetchProducts(selectedCatalogId)
    } catch (error: any) {
      console.error("Failed to update product:", error)
      toast({ 
        title: "Failed to update product", 
        description: error?.response?.data?.message || error.message || "Please try again",
        variant: "destructive" 
      })
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <div className="flex items-center gap-2">
            {catalogs.length > 0 && selectedCatalogId && (
              <>
                <Button
                  onClick={handleCreateProduct}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
                <Button
                  onClick={handleSyncProducts}
                  disabled={syncing}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync from Meta"}
                </Button>
              </>
            )}
          </div>
        </div>

        {catalogs.length === 0 ? (
          <Card className="p-6 border border-gray-200 rounded-lg">
            <p className="text-gray-700">
              No catalog is connected yet. Connect a catalog first to see its products here.
            </p>
          </Card>
        ) : loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <Card className="p-6 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-700 mb-4">
              No products found in this catalog. Click "Sync from Meta" to fetch products or "Add Product" to create one.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleCreateProduct}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button
                onClick={handleSyncProducts}
                disabled={syncing}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync from Meta"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="p-4 border border-gray-200 rounded-lg relative">
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    onClick={() => handleEditProduct(product)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteProduct(product)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-2 pr-16">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                )}
                <div className="space-y-1 mb-2">
                  <p className="text-lg font-bold text-gray-900">
                    {product.currency || "INR"} {parseFloat(product.price || 0).toLocaleString()}
                  </p>
                  {product.inventory !== undefined && product.inventory !== null && (
                    <p className="text-sm text-gray-600">Stock: {product.inventory}</p>
                  )}
                  {product.brand && (
                    <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                  )}
                  {product.category && (
                    <p className="text-sm text-gray-600">Category: {product.category}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    product.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.status}
                  </span>
                  {product.availability && (
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {product.availability}
                    </span>
                  )}
                  {product.condition && (
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                      {product.condition}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your Meta catalog. All fields will be synced with Meta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="retailer_id">Retailer ID</Label>
                <Input
                  id="retailer_id"
                  name="retailer_id"
                  value={formData.retailer_id}
                  onChange={handleInputChange}
                  placeholder="Unique retailer ID"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inventory">Inventory/Stock</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => handleSelectChange("availability", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in stock">In Stock</SelectItem>
                    <SelectItem value="out of stock">Out of Stock</SelectItem>
                    <SelectItem value="available for order">Available for Order</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Brand name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Product category"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="url">Product URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/product"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Changes will be synced with Meta catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit-retailer_id">Retailer ID</Label>
                <Input
                  id="edit-retailer_id"
                  name="retailer_id"
                  value={formData.retailer_id}
                  onChange={handleInputChange}
                  placeholder="Unique retailer ID"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-inventory">Inventory/Stock</Label>
                <Input
                  id="edit-inventory"
                  name="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => handleSelectChange("availability", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in stock">In Stock</SelectItem>
                    <SelectItem value="out of stock">Out of Stock</SelectItem>
                    <SelectItem value="available for order">Available for Order</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-brand">Brand</Label>
                <Input
                  id="edit-brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Brand name"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Product category"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="edit-url">Product URL</Label>
              <Input
                id="edit-url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/product"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false)
              setEditingProduct(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting}>
              {submitting ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
