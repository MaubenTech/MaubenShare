"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Camera, Upload, Calendar, CheckCircle, ChevronDown, ChevronUp, FileImage } from "lucide-react";
import WaitingAnimation from "@/components/waiting-animation";

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

export default function HomePage() {
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [sessionId, setSessionId] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [showHowItWorks, setShowHowItWorks] = useState(false);
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const cutoffDate = new Date("2025-08-30");
		const currentDate = new Date();
		setIsActive(currentDate < cutoffDate);

		const newSessionId = Math.random().toString(36).substring(2, 15);
		setSessionId(newSessionId);

		const uploadUrl = `http://192.168.100.18:3000/upload/${newSessionId}`;
		// const uploadUrl = `${window.location.origin}/upload/${newSessionId}`;
		setQrCodeUrl(uploadUrl);

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
		if (!file || !isActive) return;

		setUploading(true);
		setUploadSuccess(false);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("sessionId", sessionId);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				setUploadSuccess(true);
				fetchPhotos(); // Refresh photos immediately
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

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	const triggerCameraUpload = () => {
		cameraInputRef.current?.click();
	};

	const generateNewSession = () => {
		const newSessionId = Math.random().toString(36).substring(2, 15);
		setSessionId(newSessionId);
		const uploadUrl = `http://192.168.100.18:3000/upload/${newSessionId}`;
		// const uploadUrl = `${window.location.origin}/upload/${newSessionId}`;
		setQrCodeUrl(uploadUrl);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-12 animate-fade-in">
					<div className="flex items-center justify-center gap-3 mb-4">
						<img
							src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MaubenTech%20Logo-SipA8ai3U25eeFB47pG70g8a3VFK4j.png"
							alt="MaubenTech Logo"
							className="h-8 w-8 object-contain"
						/>
						<Camera className="h-8 w-8 text-primary" />
						<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MaubenShare</h1>
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Share your moments instantly with QR code photo uploads</p>
				</div>

				{/* Status Banner */}
				<div className="mb-8">
					{isActive ? (
						<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
							<CheckCircle className="h-5 w-5 text-primary" />
							<div>
								<p className="font-medium text-primary">Photo uploads are active</p>
								<p className="text-sm text-primary/80">Upload deadline: August 30th, 2025</p>
							</div>
						</div>
					) : (
						<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
							<Calendar className="h-5 w-5 text-destructive" />
							<div>
								<p className="font-medium text-destructive">Photo uploads have ended</p>
								<p className="text-sm text-destructive/80">The upload period ended on August 30th, 2025</p>
							</div>
						</div>
					)}
				</div>

				{isActive && (
					<div className="mb-8 flex justify-center">
						<div className="flex gap-4">
							<Button
								onClick={triggerCameraUpload}
								disabled={uploading}
								className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
								<Camera className="h-4 w-4" />
								{uploading ? "Uploading..." : "Take Photo"}
							</Button>
							<Button
								onClick={triggerFileUpload}
								disabled={uploading}
								variant="outline"
								className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 bg-transparent">
								<FileImage className="h-4 w-4" />
								Choose Photo
							</Button>
						</div>

						{/* Hidden file inputs */}
						<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
						<input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
					</div>
				)}

				{uploadSuccess && (
					<div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 text-center animate-fade-in">
						<CheckCircle className="h-5 w-5 text-primary mx-auto mb-2" />
						<p className="text-primary font-medium">Photo uploaded successfully!</p>
					</div>
				)}

				{/* Main Content - Photos or Waiting Animation */}
				{loading ? (
					<div className="flex justify-center items-center min-h-[400px]">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : photos.length > 0 ? (
					<div className="mb-8">
						<h2 className="text-2xl font-bold mb-6 text-center">Shared Photos</h2>
						<div className="photo-grid-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
							{photos.slice(0, 20).map((photo, index) => (
								<div
									key={photo.id}
									className="photo-item aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 animate-photo-appear shadow-sm hover:shadow-lg transition-all duration-300"
									style={{ animationDelay: `${index * 50}ms` }}
									onClick={() => window.open(photo.url, "_blank")}
									title={photo.originalName}>
									<img
										src={photo.url || "/placeholder.svg"}
										alt={`${photo.originalName || `Shared photo ${index + 1}`}`}
										className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
										loading="lazy"
									/>
								</div>
							))}
						</div>
						{photos.length > 20 && (
							<div className="text-center mt-6">
								<Button onClick={() => (window.location.href = "/gallery")} variant="outline" className="animate-fade-in">
									View All {photos.length} Photos
								</Button>
							</div>
						)}
					</div>
				) : (
					<WaitingAnimation />
				)}

				{/* How It Works Button */}
				<div className="text-center mb-8">
					<Button
						onClick={() => setShowHowItWorks(!showHowItWorks)}
						variant="outline"
						className="flex items-center gap-2 animate-fade-in border-primary/20 hover:bg-primary/5">
						How it works
						{showHowItWorks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
					</Button>
				</div>

				{/* How It Works Section - Collapsible */}
				<div
					className={`transition-all duration-500 ease-in-out overflow-hidden ${
						showHowItWorks ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
					}`}>
					<div className="grid lg:grid-cols-2 gap-8 items-start">
						{/* QR Code Section */}
						<Card className="animate-slide-up">
							<CardHeader className="text-center">
								<CardTitle className="flex items-center justify-center gap-2">
									<Upload className="h-5 w-5" />
									Scan to Upload Photos
								</CardTitle>
								<CardDescription>Point your phone camera at this QR code to start uploading photos</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col items-center space-y-6">
								{qrCodeUrl && (
									<div className="bg-white p-6 rounded-xl shadow-lg animate-scale-in">
										<QRCodeSVG value={qrCodeUrl} size={200} level="M" includeMargin={true} className="w-full h-auto" />
									</div>
								)}

								<div className="text-center space-y-2">
									<p className="text-sm text-muted-foreground">Session ID: {sessionId}</p>
									<Button onClick={generateNewSession} variant="outline" disabled={!isActive} className="animate-fade-in bg-transparent">
										Generate New QR Code
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Instructions Section */}
						<Card className="animate-slide-up animation-delay-200">
							<CardHeader>
								<CardTitle>How it works</CardTitle>
								<CardDescription>Simple steps to start sharing photos</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
										<span className="text-primary font-bold text-sm">1</span>
									</div>
									<div>
										<h4 className="font-medium">Scan the QR Code</h4>
										<p className="text-sm text-muted-foreground">Use your phone's camera to scan the QR code above</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
										<span className="text-primary font-bold text-sm">2</span>
									</div>
									<div>
										<h4 className="font-medium">Take Photos</h4>
										<p className="text-sm text-muted-foreground">Capture moments directly from your phone's camera</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
										<span className="text-primary font-bold text-sm">3</span>
									</div>
									<div>
										<h4 className="font-medium">Instant Upload</h4>
										<p className="text-sm text-muted-foreground">Photos are automatically saved to the shared collection</p>
									</div>
								</div>

								<div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
									<p className="text-sm text-accent-foreground">
										<strong>Note:</strong> Photo uploads will automatically stop after August 30th, 2025
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
