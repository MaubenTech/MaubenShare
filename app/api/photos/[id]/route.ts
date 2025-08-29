import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photoId = params.id

    // In a real app, you'd fetch the photo URL from your database
    // For now, we'll try to delete from blob storage directly
    // This is a simplified approach - in production you'd want proper photo tracking

    await del(photoId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
