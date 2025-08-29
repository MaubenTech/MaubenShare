"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function UploadPage() {
	const params = useParams();
	const router = useRouter();
	const sessionId = params.sessionId as string;

	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
	const [isActive, setIsActive] = useState(true);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Check if current date is before August 30th, 2025
		const cutoffDate = new Date("2025-08-31");
		const currentDate = new Date();
		setIsActive(currentDate < cutoffDate);
	}, []);

	const handleFileSelect = useCallback(
		async (file: File) => {
			if (!isActive) {
				setUploadStatus("error");
				return;
			}

			setIsUploading(true);
			setUploadStatus("idle");

			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("sessionId", sessionId);

				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					setUploadStatus("success");
					// Create preview of uploaded image
					const imageUrl = URL.createObjectURL(file);
					setCapturedImage(imageUrl);
				} else {
					setUploadStatus("error");
				}
			} catch (error) {
				console.error("Upload failed:", error);
				setUploadStatus("error");
			} finally {
				setIsUploading(false);
			}
		},
		[sessionId, isActive]
	);

	const handleCameraCapture = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleUploadAnother = () => {
		setUploadStatus("idle");
		setCapturedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	if (!isActive) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<CardTitle className="text-red-600">Upload Period Ended</CardTitle>
						<CardDescription>Photo uploads ended on August 30th, 2025</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button onClick={() => router.push("/")} variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<Button onClick={() => router.push("/")} variant="ghost" className="mb-4">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Button>

					<div className="flex items-center justify-center gap-3 mb-4">
						<Camera className="h-8 w-8 text-blue-600" />
						<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upload Photos</h1>
					</div>
					<p className="text-muted-foreground">Session: {sessionId}</p>
				</div>

				{/* Upload Interface */}
				<div className="max-w-md mx-auto">
					<Card className="animate-slide-up">
						<CardHeader className="text-center">
							<CardTitle>Capture & Upload</CardTitle>
							<CardDescription>Take a photo or select from your gallery</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{uploadStatus !== "success" ? (
								<Button onClick={handleCameraCapture} disabled={isUploading} size="lg" className="w-full h-16 text-lg animate-pulse-subtle">
									<Camera className="h-6 w-6 mr-3" />
									{isUploading ? "Uploading..." : "Take Photo"}
								</Button>
							) : (
								<div className="space-y-3">
									<Button onClick={handleUploadAnother} size="lg" className="w-full h-16 text-lg" variant="default">
										<Plus className="h-6 w-6 mr-3" />
										Upload Another Photo
									</Button>
									<Button onClick={() => router.push("/")} size="lg" className="w-full h-12" variant="outline">
										View All Photos
									</Button>
								</div>
							)}

							{/* Hidden file input */}
							<input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

							{/* Status Messages */}
							{uploadStatus === "success" && (
								<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
									<CheckCircle className="h-5 w-5 text-green-600" />
									<p className="text-green-800 dark:text-green-200 font-medium">Photo uploaded successfully!</p>
								</div>
							)}

							{uploadStatus === "error" && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
									<AlertCircle className="h-5 w-5 text-red-600" />
									<p className="text-red-800 dark:text-red-200 font-medium">Upload failed. Please try again.</p>
								</div>
							)}

							{/* Image Preview */}
							{capturedImage && (
								<div className="animate-scale-in">
									<img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-48 object-cover rounded-lg border" />
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
