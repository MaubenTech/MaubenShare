"use client"

export default function WaitingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="animate-bounce mb-6">
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          I'm Waiting for your images!
        </h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-md">Scan the QR code below to start uploading your photos</p>
    </div>
  )
}
