import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase, getPhotoBucket } from "@/lib/mongodb";
import { PHOTOS_COLLECTION, type PhotoDocument } from "@/lib/models/Photo";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = await params;
		const photoId = id;
		const db = await getDatabase();
		const photoBucket = await getPhotoBucket();

		const photo = await db.collection<PhotoDocument>(PHOTOS_COLLECTION).findOne({
			_id: new ObjectId(photoId),
			isDeleted: false,
		});

		if (!photo) {
			return NextResponse.json({ error: "Photo not found" }, { status: 404 });
		}

		const downloadStream = photoBucket.openDownloadStream(photo.fileId);

		const chunks: Buffer[] = [];

		return new Promise((resolve, reject) => {
			downloadStream.on("data", (chunk) => {
				chunks.push(chunk);
			});

			downloadStream.on("end", () => {
				const buffer = Buffer.concat(chunks);
				const response = new NextResponse(buffer, {
					headers: {
						"Content-Type": photo.mimeType,
						"Content-Length": photo.size.toString(),
						"Cache-Control": "public, max-age=31536000",
						"Content-Disposition": `inline; filename="${photo.originalName}"`,
					},
				});
				resolve(response);
			});

			downloadStream.on("error", (error) => {
				console.error("GridFS download error:", error);
				reject(NextResponse.json({ error: "Failed to serve photo" }, { status: 500 }));
			});
		});
	} catch (error) {
		console.error("Serve photo error:", error);
		return NextResponse.json({ error: "Failed to serve photo" }, { status: 500 });
	}
}
