import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    // In a real implementation, fetch from database
    // Mock data for demonstration
    const configurations = [
      {
        id: "1",
        name: "upialok",
        provider: null,
        status: "active",
        mcc: "0000",
        mccDescription: "Test MCC Code",
        purposeCode: "00",
        purposeCodeDescription: "Test Purpose Code",
        upiVpa: "alokmotion@ybl",
        createdAt: "2025-12-17T00:47:31Z",
        updatedAt: "2025-12-17T00:47:31Z"
      },
      {
        id: "2",
        name: "testalok",
        provider: "Razorpay",
        status: "active",
        paymentGatewayMid: "acc_OJr2Ad6mQtE79U",
        mcc: "0000",
        mccDescription: "Test MCC Code",
        purposeCode: "00",
        purposeCodeDescription: "Test Purpose Code",
        createdAt: "2025-12-16T21:42:45Z",
        updatedAt: "2025-12-16T21:45:08Z"
      }
    ]

    return NextResponse.json({
      success: true,
      data: configurations
    })
  } catch (error: any) {
    console.error("Error fetching payment configurations:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to fetch payment configurations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // In a real implementation, save to database
    const newConfig = {
      id: Date.now().toString(),
      ...body,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newConfig
    })
  } catch (error: any) {
    console.error("Error creating payment configuration:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to create payment configuration" },
      { status: 500 }
    )
  }
}
