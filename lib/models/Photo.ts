import type { ObjectId } from "mongodb";

export interface PhotoDocument {
	_id?: ObjectId;
	fileId: ObjectId; // GridFS file ID
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	sessionId: string;
	uploadedAt: Date;
	uploadedBy?: string;
	metadata?: {
		width?: number;
		height?: number;
		deviceInfo?: string;
		location?: {
			latitude?: number;
			longitude?: number;
		};
	};
	tags?: string[];
	isDeleted: boolean;
	deletedAt?: Date;
}

export interface PhotoMetadata {
	id: string;
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	url: string; // Will be /api/photos/[id]/file
	sessionId: string;
	uploadedAt: string;
	metadata?: {
		width?: number;
		height?: number;
		deviceInfo?: string;
	};
	tags?: string[];
}

export const PHOTOS_COLLECTION = "photos";
