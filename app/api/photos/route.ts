import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

interface PhotoMetadata {
	id: string;
	url: string;
	uploadedAt: string;
	size: number;
	sessionId: string;
	filename: string;
}

export async function GET() {
	try {
		const { blobs } = await list();

		const photos: PhotoMetadata[] = blobs.map((blob) => ({
			id: blob.pathname.split("/").pop() || "",
			url: blob.url,
			uploadedAt: blob.uploadedAt.toISOString(),
			size: blob.size,
			sessionId: blob.pathname.split("/")[0] || "unknown",
			filename: blob.pathname.split("/").pop() || "unknown",
		}));

		// Sort by upload date (newest first)
		photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

		return NextResponse.json({
			success: true,
			photos,
			total: photos.length,
		});
	} catch (error) {
		console.error("Error fetching photos:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch photos" }, { status: 500 });
	}
}
