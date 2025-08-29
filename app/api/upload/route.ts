import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sessionId = formData.get("sessionId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if current date is before August 30th, 2025
    const cutoffDate = new Date("2025-08-30")
    const currentDate = new Date()

    if (currentDate >= cutoffDate) {
      return NextResponse.json({ error: "Upload period has ended" }, { status: 403 })
    }

    // Create filename with session ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `${sessionId}/${timestamp}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      sessionId,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
