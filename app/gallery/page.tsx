"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Calendar, ImageIcon, Loader2, Camera, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Photo {
	url: string;
	filename: string;
	size: number;
	uploadedAt: string;
	sessionId?: string;
}

export default function GalleryPage() {
	const router = useRouter();
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [showUpload, setShowUpload] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchPhotos();
		const interval = setInterval(fetchPhotos, 5000);
		return () => clearInterval(interval);
	}, []);

	const fetchPhotos = async () => {
		try {
			const response = await fetch("/api/list");
			if (response.ok) {
				const data = await response.json();
				setPhotos(data.files || []);
			}
		} catch (error) {
			console.error("Failed to fetch photos:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		// Check if upload is still active (before August 30, 2025)
		const cutoffDate = new Date("2025-08-30");
		const currentDate = new Date();

		if (currentDate > cutoffDate) {
			alert("Photo uploads are no longer active. The upload period ended on August 30, 2025.");
			return;
		}

		setUploading(true);
		setUploadSuccess(false);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				setUploadSuccess(true);
				setShowUpload(false);
				// Refresh photos immediately after upload
				await fetchPhotos();
				setTimeout(() => setUploadSuccess(false), 3000);
			} else {
				const error = await response.json();
				alert(error.error || "Upload failed");
			}
		} catch (error) {
			console.error("Upload error:", error);
			alert("Upload failed. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileUpload(file);
		}
	};

	const downloadPhoto = (photo: Photo) => {
		const link = document.createElement("a");
		link.href = photo.url;
		link.download = photo.filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-muted-foreground">Loading photos...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<Button onClick={() => router.push("/")} variant="ghost" className="mb-4 animate-fade-in">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Button>

					<div className="text-center">
						<div className="flex items-center justify-center gap-3 mb-4">
							<ImageIcon className="h-8 w-8 text-blue-600" />
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Photo Gallery</h1>
						</div>
						<p className="text-lg text-muted-foreground mb-4">
							{photos.length} {photos.length === 1 ? "photo" : "photos"} uploaded
						</p>

						<div className="flex items-center justify-center gap-3">
							<Button
								onClick={() => setShowUpload(!showUpload)}
								className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
								<Upload className="h-4 w-4 mr-2" />
								Add Photos
							</Button>
							{uploadSuccess && <div className="text-green-600 font-medium animate-fade-in">✓ Photo uploaded successfully!</div>}
						</div>
					</div>
				</div>

				{showUpload && (
					<div className="mb-8 animate-slide-down">
						<Card className="max-w-md mx-auto">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold">Upload Photos</h3>
									<Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
										<X className="h-4 w-4" />
									</Button>
								</div>

								<div className="space-y-3">
									<Button
										onClick={() => cameraInputRef.current?.click()}
										disabled={uploading}
										className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
										{uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
										Take Photo
									</Button>

									<Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="w-full">
										{uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
										Choose File
									</Button>
								</div>

								<input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

								<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
							</CardContent>
						</Card>
					</div>
				)}

				{/* Gallery Grid */}
				{photos.length === 0 ? (
					<div className="text-center py-16">
						<ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
						<h3 className="text-xl font-semibold text-muted-foreground mb-2">No photos yet</h3>
						<p className="text-muted-foreground mb-6">Upload your first photo or scan the QR code</p>
						<Button onClick={() => router.push("/")}>Generate QR Code</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{photos.map((photo, index) => (
							<Card
								key={photo.url}
								className="group cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up overflow-hidden"
								style={{ animationDelay: `${index * 100}ms` }}
								onClick={() => setSelectedPhoto(photo)}>
								<CardContent className="p-0">
									<div className="aspect-square relative overflow-hidden">
										<img
											src={photo.url || "/placeholder.svg"}
											alt={photo.filename}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											loading="lazy"
										/>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
											<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
												<Button
													size="sm"
													variant="secondary"
													onClick={(e) => {
														e.stopPropagation();
														downloadPhoto(photo);
													}}
													className="backdrop-blur-sm">
													<Download className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
									<div className="p-3">
										<p className="text-sm font-medium truncate">{photo.filename}</p>
										<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
											<Calendar className="h-3 w-3" />
											<span>{formatDate(photo.uploadedAt)}</span>
										</div>
										<p className="text-xs text-muted-foreground mt-1">{formatFileSize(photo.size)}</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Photo Modal */}
				{selectedPhoto && (
					<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
						<div className="max-w-4xl max-h-full relative animate-scale-in">
							<img
								src={selectedPhoto.url || "/placeholder.svg"}
								alt={selectedPhoto.filename}
								className="max-w-full max-h-full object-contain rounded-lg"
							/>
							<div className="absolute top-4 right-4 flex gap-2">
								<Button
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										downloadPhoto(selectedPhoto);
									}}
									className="backdrop-blur-sm">
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
								<Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(null)} className="backdrop-blur-sm">
									Close
								</Button>
							</div>
							<div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
								<p className="font-medium">{selectedPhoto.filename}</p>
								<div className="flex items-center gap-4 text-sm opacity-90 mt-1">
									<span>{formatDate(selectedPhoto.uploadedAt)}</span>
									<span>{formatFileSize(selectedPhoto.size)}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
