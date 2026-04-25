import { type NextRequest, NextResponse } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() 

    const backendUrl = getBackendApiBaseUrl()
    const targetUrl = `${backendUrl}/api/wallet/verify`
    console.log(`🚀 Proxying verification request to: ${targetUrl}`)
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type")
    
    if (!response.ok) {
      const errorData = contentType?.includes("application/json") ? await response.json() : await response.text()
      console.error(`Backend Verification Failed (${response.status}):`, errorData)
      return NextResponse.json(
        typeof errorData === "string" ? { message: errorData } : errorData, 
        { status: response.status }
      )
    }

    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Backend returned non-JSON response:", text);
        return NextResponse.json({ message: "Invalid server response", detail: text }, { status: 500 });
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Verification proxy error:", error)
    return NextResponse.json(
      { message: "Verification failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
