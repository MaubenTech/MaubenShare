import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase, getPhotoBucket } from "@/lib/mongodb";
import { PHOTOS_COLLECTION, type PhotoDocument } from "@/lib/models/Photo";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const photoId = params.id;
		const db = await getDatabase();
		const photoBucket = await getPhotoBucket();

		const photo = await db.collection<PhotoDocument>(PHOTOS_COLLECTION).findOne({
			_id: new ObjectId(photoId),
			isDeleted: false,
		});

		if (!photo) {
			return NextResponse.json({ error: "Photo not found" }, { status: 404 });
		}

		try {
			await photoBucket.delete(photo.fileId);
		} catch (gridfsError) {
			console.error("GridFS deletion error:", gridfsError);
			// Continue with soft delete even if GridFS deletion fails
		}

		await db.collection<PhotoDocument>(PHOTOS_COLLECTION).updateOne(
			{ _id: new ObjectId(photoId) },
			{
				$set: {
					isDeleted: true,
					deletedAt: new Date(),
				},
			}
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Delete photo error:", error);
		return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
	}
}
