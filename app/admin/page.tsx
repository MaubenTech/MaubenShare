"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Eye, Download, LogOut } from "lucide-react";

interface Photo {
	id: string;
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	url: string;
	sessionId: string;
	uploadedAt: string;
	metadata?: {
		width?: number;
		height?: number;
		deviceInfo?: string;
	};
	tags?: string[];
}

export default function AdminPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

	useEffect(() => {
		if (isAuthenticated) {
			fetchPhotos();
		}
	}, [isAuthenticated]);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (email === "maubentech@gmail.com" && password === "1917hcetnebuam") {
			setIsAuthenticated(true);
		} else {
			setError("Invalid credentials");
		}
	};

	const fetchPhotos = async () => {
		setLoading(true);
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

	const deletePhoto = async (photoId: string) => {
		if (!confirm("Are you sure you want to delete this photo?")) return;

		try {
			const response = await fetch(`/api/photos/${photoId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setPhotos(photos.filter((photo) => photo.id !== photoId));
				setSelectedPhoto(null);
			} else {
				alert("Failed to delete photo");
			}
		} catch (error) {
			console.error("Failed to delete photo:", error);
			alert("Failed to delete photo");
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex items-center justify-center gap-3 mb-4">
							<Camera className="h-8 w-8 text-blue-600" />
							<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MaubenShare Admin</h1>
						</div>
						<CardDescription>Sign in to manage photos</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
							</div>
							{error && <div className="text-red-600 text-sm text-center">{error}</div>}
							<Button type="submit" className="w-full">
								Sign In
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<Camera className="h-8 w-8 text-blue-600" />
						<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MaubenShare Admin</h1>
					</div>
					<Button onClick={() => setIsAuthenticated(false)} variant="outline" className="flex items-center gap-2">
						<LogOut className="h-4 w-4" />
						Sign Out
					</Button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
									<Camera className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{photos.length}</p>
									<p className="text-sm text-muted-foreground">Total Photos</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
									<Eye className="h-6 w-6 text-green-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{new Set(photos.map((p) => p.sessionId)).size}</p>
									<p className="text-sm text-muted-foreground">Sessions</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
									<Download className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{formatFileSize(photos.reduce((acc, photo) => acc + photo.size, 0))}</p>
									<p className="text-sm text-muted-foreground">Total Size</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Photos Grid */}
				{loading ? (
					<div className="flex justify-center items-center min-h-[400px]">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : (
					<div className="photo-grid-container">
						{photos.map((photo, index) => (
							<div
								key={photo.id}
								className="photo-item bg-gray-100 dark:bg-gray-800 relative group animate-photo-appear"
								style={{ animationDelay: `${index * 30}ms` }}
								onClick={() => setSelectedPhoto(photo)}>
								<img
									src={photo.url || "/placeholder.svg"}
									alt={photo.originalName || `Photo ${index + 1}`}
									loading="lazy"
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
									<Button
										size="sm"
										variant="destructive"
										onClick={(e) => {
											e.stopPropagation();
											deletePhoto(photo.id);
										}}
										className="flex items-center gap-1">
										<Trash2 className="h-3 w-3" />
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Photo Modal */}
				{selectedPhoto && (
					<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
						<div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
							<div className="p-4 border-b">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold">{selectedPhoto.originalName}</h3>
									<Button variant="destructive" size="sm" onClick={() => deletePhoto(selectedPhoto.id)} className="flex items-center gap-1">
										<Trash2 className="h-3 w-3" />
										Delete
									</Button>
								</div>
							</div>
							<div className="p-4">
								<img
									src={selectedPhoto.url || "/placeholder.svg"}
									alt={selectedPhoto.originalName}
									className="max-w-full max-h-[60vh] object-contain mx-auto"
								/>
								<div className="mt-4 text-sm text-muted-foreground space-y-1">
									<p>
										<strong>Original Name:</strong> {selectedPhoto.originalName}
									</p>
									<p>
										<strong>File Type:</strong> {selectedPhoto.mimeType}
									</p>
									<p>
										<strong>Session:</strong> {selectedPhoto.sessionId}
									</p>
									<p>
										<strong>Size:</strong> {formatFileSize(selectedPhoto.size)}
									</p>
									<p>
										<strong>Uploaded:</strong> {formatDate(selectedPhoto.uploadedAt)}
									</p>
									{selectedPhoto.metadata?.deviceInfo && (
										<p>
											<strong>Device:</strong> {selectedPhoto.metadata.deviceInfo.split(" ")[0]}
										</p>
									)}
									{selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
										<p>
											<strong>Tags:</strong> {selectedPhoto.tags.join(", ")}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
