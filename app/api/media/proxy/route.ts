import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url")

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        // Needed for ngrok-hosted assets to bypass the browser warning splash
        "ngrok-skip-browser-warning": "true",
      },
    })

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { error: "Failed to fetch remote media" },
        { status: upstreamResponse.status || 502 }
      )
    }

    const headers = new Headers()
    const contentType = upstreamResponse.headers.get("content-type") || "application/octet-stream"
    headers.set("Content-Type", contentType)
    headers.set("Cache-Control", "public, max-age=60")

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    return NextResponse.json({ error: "Media proxy error" }, { status: 500 })
  }
}

