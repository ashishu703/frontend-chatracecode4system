import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // In a real implementation, update in database
    const updatedConfig = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedConfig
    })
  } catch (error: any) {
    console.error("Error updating payment configuration:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to update payment configuration" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // In a real implementation, delete from database

    return NextResponse.json({
      success: true,
      data: { id }
    })
  } catch (error: any) {
    console.error("Error deleting payment configuration:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to delete payment configuration" },
      { status: 500 }
    )
  }
}
