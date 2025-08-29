import { MongoClient, type Db, GridFSBucket } from "mongodb";

let client: MongoClient;
let db: Db;
let photoBucket: GridFSBucket;

export async function connectToDatabase() {
	if (db) {
		return { client, db, photoBucket };
	}

	if (!process.env.MONGODB_URI) {
		throw new Error("Please add your MongoDB URI to .env.local");
	}

	client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	db = client.db("maubenshare");

	photoBucket = new GridFSBucket(db, { bucketName: "photos" });

	return { client, db, photoBucket };
}

export async function getDatabase() {
	const { db } = await connectToDatabase();
	return db;
}

export async function getPhotoBucket() {
	const { photoBucket } = await connectToDatabase();
	return photoBucket;
}
