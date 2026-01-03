import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ success: false, msg: "Status is required" }, { status: 400 })
    }

    // In a real implementation, update order status in database
    // For now, return success

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to update order status" },
      { status: 500 }
    )
  }
}
