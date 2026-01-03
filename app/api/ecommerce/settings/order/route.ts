import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    // In a real implementation, fetch from database
    const settings = {
      paymentMethods: {
        cod: {
          enabled: true,
          minAmount: 0,
          maxAmount: "No limit"
        },
        razorpay: {
          enabled: false
        },
        upi: {
          enabled: false
        }
      },
      shipping: {
        standard: {
          enabled: true,
          deliveryTime: "3-5 business days",
          charges: 50
        }
      },
      checkout: {
        addressCollection: {
          enabled: true,
          method: "Interactive (Buttons/Quick Replies)",
          requiredFields: {
            name: true,
            address: true,
            city: true,
            pincode: true,
            state: true,
            phone: true
          },
          optionalFields: {
            landmark: true,
            alternatephone: true
          }
        },
        autoConfirm: false,
        minOrderAmount: 100,
        maxOrderAmount: 50000,
        maxItemsPerOrder: 10
      },
      statusMessages: {
        pending: {
          enabled: true,
          message: "Hi {{customer_name}}, Your order #{{order_id}} is being processed. We'll update you soon!",
          sendDelay: 0
        },
        confirmed: {
          enabled: true,
          message: "Hi {{customer_name}},\n✅ Order Confirmed!",
          sendDelay: 0
        },
        shipped: {
          enabled: false,
          message: "",
          sendDelay: 0
        },
        delivered: {
          enabled: false,
          message: "",
          sendDelay: 0
        },
        cancelled: {
          enabled: false,
          message: "",
          sendDelay: 0
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error: any) {
    console.error("Error fetching order settings:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to fetch order settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // In a real implementation, save to database
    const updatedSettings = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings
    })
  } catch (error: any) {
    console.error("Error updating order settings:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to update order settings" },
      { status: 500 }
    )
  }
}
