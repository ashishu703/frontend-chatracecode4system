import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would fetch user's flows from a database
    // For now, we'll return mock data
    const mockFlows = [
      {
        id: "flow_1",
        name: "Customer Support Flow",
        description: "Handle customer inquiries and support requests",
        createdAt: "2024-01-15T10:30:00Z",
        nodeCount: 12,
        lastModified: "2024-01-16T14:20:00Z",
      },
      {
        id: "flow_2",
        name: "Lead Generation Flow",
        description: "Qualify leads and collect contact information",
        createdAt: "2024-01-10T09:15:00Z",
        nodeCount: 8,
        lastModified: "2024-01-12T16:45:00Z",
      },
    ]

    return NextResponse.json({
      success: true,
      flows: mockFlows,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch flows" }, { status: 500 })
  }
}
