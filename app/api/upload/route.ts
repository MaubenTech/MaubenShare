import { type NextRequest, NextResponse } from "next/server";
import { getDatabase, getPhotoBucket } from "@/lib/mongodb";
import { PHOTOS_COLLECTION, type PhotoDocument } from "@/lib/models/Photo";
import type { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
	console.log("[v0] Upload request started");

	try {
		console.log("[v0] Parsing form data...");
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const sessionId = formData.get("sessionId") as string;

		console.log("[v0] Form data parsed:", {
			hasFile: !!file,
			fileName: file?.name,
			fileSize: file?.size,
			sessionId: sessionId,
		});

		if (!file) {
			console.log("[v0] No file provided in request");
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Check if current date is before August 30th, 2025
		const cutoffDate = new Date("2025-09-25");
		const currentDate = new Date();

		console.log("[v0] Date check:", {
			currentDate: currentDate.toISOString(),
			cutoffDate: cutoffDate.toISOString(),
			isBeforeCutoff: currentDate < cutoffDate,
		});

		if (currentDate >= cutoffDate) {
			console.log("[v0] Upload period has ended");
			return NextResponse.json({ error: "Upload period has ended" }, { status: 403 });
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `${sessionId}/${timestamp}-${file.name}`;
		console.log("[v0] Generated filename:", filename);

		// Get GridFS bucket and database
		console.log("[v0] Connecting to database...");
		try {
			const photoBucket = await getPhotoBucket();
			const db = await getDatabase();
			console.log("[v0] Database connection successful");
		} catch (dbError) {
			console.error("[v0] Database connection failed:", dbError);
			throw dbError;
		}

		const photoBucket = await getPhotoBucket();
		const db = await getDatabase();

		// Convert file to buffer
		console.log("[v0] Converting file to buffer...");
		const buffer = Buffer.from(await file.arrayBuffer());
		console.log("[v0] Buffer created, size:", buffer.length);

		// Upload to GridFS
		console.log("[v0] Starting GridFS upload...");
		const uploadStream = photoBucket.openUploadStream(filename, {
			metadata: {
				originalName: file.name,
				mimeType: file.type,
				sessionId: sessionId,
				uploadedAt: new Date(),
				uploadedBy: request.headers.get("x-forwarded-for") || "unknown",
				deviceInfo: request.headers.get("user-agent") || undefined,
			},
		});

		// Create a promise to handle the upload
		const fileId = await new Promise<ObjectId>((resolve, reject) => {
			uploadStream.on("finish", () => {
				console.log("[v0] GridFS upload finished, fileId:", uploadStream.id);
				resolve(uploadStream.id as ObjectId);
			});
			uploadStream.on("error", (error) => {
				console.error("[v0] GridFS upload error:", error);
				reject(error);
			});
			console.log("[v0] Writing buffer to GridFS stream...");
			uploadStream.end(buffer);
		});

		// Save photo metadata to photos collection
		console.log("[v0] Saving photo metadata to collection...");
		const photoDoc: PhotoDocument = {
			fileId: fileId,
			filename: filename,
			originalName: file.name,
			mimeType: file.type,
			size: file.size,
			sessionId: sessionId,
			uploadedAt: new Date(),
			uploadedBy: request.headers.get("x-forwarded-for") || "unknown",
			metadata: {
				deviceInfo: request.headers.get("user-agent") || undefined,
			},
			tags: [],
			isDeleted: false,
		};

		const result = await db.collection(PHOTOS_COLLECTION).insertOne(photoDoc);
		console.log("[v0] Photo metadata saved, insertedId:", result.insertedId);

		console.log("[v0] Upload completed successfully");
		return NextResponse.json({
			id: result.insertedId.toString(),
			url: `/api/photos/${result.insertedId}/file`,
			filename: file.name,
			size: file.size,
			type: file.type,
			sessionId,
		});
	} catch (error) {
		console.error("[v0] Upload error:", error);
		console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace");
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
