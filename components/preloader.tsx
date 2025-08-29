"use client"

import { useState, useEffect } from "react"

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setTimeout(onComplete, 500) // Allow fade out animation
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-opacity duration-500 ${!isAnimating ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative">
        <div className="animate-logo-assemble">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MaubenTech%20Logo-FSCnU1LsZEpSBjXMnup3SNd2FNv37C.png"
            alt="MaubenTech Logo"
            width={120}
            height={120}
            className="animate-pulse"
          />
        </div>

        {/* Loading text */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            MaubenShare
          </h2>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
