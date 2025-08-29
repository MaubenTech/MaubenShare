import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { PHOTOS_COLLECTION, type PhotoDocument, type PhotoMetadata } from "@/lib/models/Photo";

export async function GET() {
	try {
		const db = await getDatabase();
		const photos = await db.collection<PhotoDocument>(PHOTOS_COLLECTION).find({ isDeleted: false }).sort({ uploadedAt: -1 }).toArray();

		const files: PhotoMetadata[] = photos.map((photo) => ({
			id: photo._id?.toString() || "",
			filename: photo.filename,
			originalName: photo.originalName,
			mimeType: photo.mimeType,
			size: photo.size,
			url: `/api/photos/${photo._id}/file`,
			sessionId: photo.sessionId,
			uploadedAt: photo.uploadedAt.toISOString(),
			metadata: photo.metadata,
			tags: photo.tags,
		}));

		return NextResponse.json({ files });
	} catch (error) {
		console.error("Error listing files:", error);
		return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
	}
}
