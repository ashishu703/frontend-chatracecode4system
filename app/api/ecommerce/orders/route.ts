import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // In a real implementation, fetch orders from database
    // Mock data for demonstration
    const mockOrders = [
      {
        id: "1",
        orderId: "WA_ORDER_1766091605568_py6sleej1",
        status: "pending",
        paymentStatus: "pending",
        customer: "919238106140",
        customerPhone: "919238106140",
        catalogId: "759886567126655",
        total: 4000.00,
        currency: "INR",
        createdAt: "2025-12-19T02:30:07Z",
        items: [
          { name: "Whatsapp Automations", quantity: 1, price: 4000.00 }
        ]
      }
    ]

    // Filter by status if provided
    let filteredOrders = mockOrders
    if (status) {
      filteredOrders = mockOrders.filter(order => order.status === status)
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: filteredOrders,
        total: filteredOrders.length,
        page,
        limit
      }
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
