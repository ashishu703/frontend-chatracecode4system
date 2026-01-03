import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                  request.cookies.get("serviceToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 })
    }

    // In a real implementation, fetch from database
    // For now, return empty array
    const catalogs: any[] = []

    return NextResponse.json({
      success: true,
      data: catalogs
    })
  } catch (error: any) {
    console.error("Error fetching catalogs:", error)
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to fetch catalogs" },
      { status: 500 }
    )
  }
}
