import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    const files = blobs.map((blob) => ({
      url: blob.url,
      filename: blob.pathname.split("/").pop() || "unknown",
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      sessionId: blob.pathname.split("/")[0], // Extract session ID from path
    }))

    // Sort by upload date, newest first
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
