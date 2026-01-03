/**
 * E-commerce Data Models
 * Using OOPs concepts for data structures
 */

export class Order {
  id: string
  orderId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  customer: string
  customerPhone: string
  catalogId: string
  total: number
  currency: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date

  constructor(data: Partial<Order>) {
    this.id = data.id || ""
    this.orderId = data.orderId || ""
    this.status = data.status || "pending"
    this.paymentStatus = data.paymentStatus || "pending"
    this.customer = data.customer || ""
    this.customerPhone = data.customerPhone || ""
    this.catalogId = data.catalogId || ""
    this.total = data.total || 0
    this.currency = data.currency || "INR"
    this.items = data.items || []
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date()
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  updateStatus(newStatus: OrderStatus): void {
    this.status = newStatus
    this.updatedAt = new Date()
  }
}

export class OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  productId?: string

  constructor(data: Partial<OrderItem>) {
    this.id = data.id || ""
    this.name = data.name || ""
    this.quantity = data.quantity || 1
    this.price = data.price || 0
    this.productId = data.productId
  }
}

export class PaymentConfiguration {
  id: string
  name: string
  provider?: string
  status: "active" | "inactive"
  paymentGatewayMid?: string
  mcc?: string
  mccDescription?: string
  purposeCode?: string
  purposeCodeDescription?: string
  upiVpa?: string
  createdAt: Date
  updatedAt: Date

  constructor(data: Partial<PaymentConfiguration>) {
    this.id = data.id || ""
    this.name = data.name || ""
    this.provider = data.provider
    this.status = data.status || "active"
    this.paymentGatewayMid = data.paymentGatewayMid
    this.mcc = data.mcc
    this.mccDescription = data.mccDescription
    this.purposeCode = data.purposeCode
    this.purposeCodeDescription = data.purposeCodeDescription
    this.upiVpa = data.upiVpa
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date()
  }

  isActive(): boolean {
    return this.status === "active"
  }
}

export class CommerceSettings {
  showCatalog: boolean
  enableCart: boolean
  updatedAt: Date

  constructor(data: Partial<CommerceSettings> = {}) {
    this.showCatalog = data.showCatalog || false
    this.enableCart = data.enableCart || false
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date()
  }
}

export class OrderSettings {
  paymentMethods: PaymentMethodsSettings
  shipping: ShippingSettings
  checkout: CheckoutSettings
  statusMessages: StatusMessagesSettings

  constructor(data: Partial<OrderSettings> = {}) {
    this.paymentMethods = data.paymentMethods || new PaymentMethodsSettings()
    this.shipping = data.shipping || new ShippingSettings()
    this.checkout = data.checkout || new CheckoutSettings()
    this.statusMessages = data.statusMessages || new StatusMessagesSettings()
  }
}

export class PaymentMethodsSettings {
  cod: CODSettings
  razorpay: PaymentProviderSettings
  upi: PaymentProviderSettings

  constructor(data: Partial<PaymentMethodsSettings> = {}) {
    this.cod = data.cod || new CODSettings()
    this.razorpay = data.razorpay || new PaymentProviderSettings()
    this.upi = data.upi || new PaymentProviderSettings()
  }
}

export class CODSettings {
  enabled: boolean
  minAmount: number
  maxAmount: string | number

  constructor(data: Partial<CODSettings> = {}) {
    this.enabled = data.enabled || false
    this.minAmount = data.minAmount || 0
    this.maxAmount = data.maxAmount || "No limit"
  }
}

export class PaymentProviderSettings {
  enabled: boolean

  constructor(data: Partial<PaymentProviderSettings> = {}) {
    this.enabled = data.enabled || false
  }
}

export class ShippingSettings {
  standard: StandardShippingSettings

  constructor(data: Partial<ShippingSettings> = {}) {
    this.standard = data.standard || new StandardShippingSettings()
  }
}

export class StandardShippingSettings {
  enabled: boolean
  deliveryTime: string
  charges: number

  constructor(data: Partial<StandardShippingSettings> = {}) {
    this.enabled = data.enabled || false
    this.deliveryTime = data.deliveryTime || "3-5 business days"
    this.charges = data.charges || 50
  }
}

export class CheckoutSettings {
  addressCollection: AddressCollectionSettings
  autoConfirm: boolean
  minOrderAmount: number
  maxOrderAmount: number
  maxItemsPerOrder: number

  constructor(data: Partial<CheckoutSettings> = {}) {
    this.addressCollection = data.addressCollection || new AddressCollectionSettings()
    this.autoConfirm = data.autoConfirm || false
    this.minOrderAmount = data.minOrderAmount || 100
    this.maxOrderAmount = data.maxOrderAmount || 50000
    this.maxItemsPerOrder = data.maxItemsPerOrder || 10
  }
}

export class AddressCollectionSettings {
  enabled: boolean
  method: string
  requiredFields: Record<string, boolean>
  optionalFields: Record<string, boolean>

  constructor(data: Partial<AddressCollectionSettings> = {}) {
    this.enabled = data.enabled || false
    this.method = data.method || "Interactive (Buttons/Quick Replies)"
    this.requiredFields = data.requiredFields || {}
    this.optionalFields = data.optionalFields || {}
  }
}

export class StatusMessagesSettings {
  pending: StatusMessageConfig
  confirmed: StatusMessageConfig
  shipped: StatusMessageConfig
  delivered: StatusMessageConfig
  cancelled: StatusMessageConfig

  constructor(data: Partial<StatusMessagesSettings> = {}) {
    this.pending = data.pending || new StatusMessageConfig()
    this.confirmed = data.confirmed || new StatusMessageConfig()
    this.shipped = data.shipped || new StatusMessageConfig()
    this.delivered = data.delivered || new StatusMessageConfig()
    this.cancelled = data.cancelled || new StatusMessageConfig()
  }
}

export class StatusMessageConfig {
  enabled: boolean
  message: string
  sendDelay: number

  constructor(data: Partial<StatusMessageConfig> = {}) {
    this.enabled = data.enabled || false
    this.message = data.message || ""
    this.sendDelay = data.sendDelay || 0
  }
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
