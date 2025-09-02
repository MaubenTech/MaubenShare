import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import GlobalPreloader from "@/components/global-preloader";

export const metadata: Metadata = {
	title: "MaubenShare - Powered by MaubenTech",
	description: "Share your moments instantly with QR code photo uploads - A MaubenTech innovation",
	generator: "v0.app",
	keywords: "photo sharing, QR code, instant upload, MaubenTech, MaubenShare",
	authors: [{ name: "MaubenTech" }],
	creator: "MaubenTech",
	publisher: "MaubenTech",
	icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
				<GlobalPreloader>{children}</GlobalPreloader>
			</body>
		</html>
	);
}
