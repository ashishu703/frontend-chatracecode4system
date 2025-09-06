import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { flowId } = await request.json()

    const mockFlowData = {
      nodes: [
        {
          id: "start-1",
          type: "startNode",
          position: { x: 250, y: 100 },
          data: {
            type: "start",
            config: {
              label: "Start",
              message: "Welcome! How can I help you today?",
            },
          },
        },
        {
          id: "text-1",
          type: "textNode",
          position: { x: 500, y: 100 },
          data: {
            type: "text",
            config: {
              label: "Greeting",
              message: "Hello! I am your virtual assistant.",
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "start-1",
          target: "text-1",
        },
      ],
      name: "Sample Flow",
      description: "A sample chatbot flow",
    }

    return NextResponse.json(mockFlowData)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load flow" }, { status: 500 })
  }
}
