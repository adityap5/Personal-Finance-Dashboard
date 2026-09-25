"use client"

import { useEffect, useRef } from "react"

export default function BackgroundVideo() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay fallback retry on first interaction if required by browser
          const handleFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {})
            }
            window.removeEventListener("click", handleFirstInteraction)
            window.removeEventListener("touchstart", handleFirstInteraction)
            window.removeEventListener("scroll", handleFirstInteraction)
          }
          window.addEventListener("click", handleFirstInteraction, { once: true })
          window.addEventListener("touchstart", handleFirstInteraction, { once: true })
          window.addEventListener("scroll", handleFirstInteraction, { once: true })
        })
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030c07]">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="https://cdn.sceneai.art/backgrounds/5a1dc3c9-a0ce-4de3-a166-6fbef98bb22a.mov"
        className="absolute inset-0 w-full h-full object-cover opacity-65"
      >
        <source
          src="https://cdn.sceneai.art/backgrounds/5a1dc3c9-a0ce-4de3-a166-6fbef98bb22a.mov"
          type="video/mp4"
        />
        <source
          src="https://cdn.sceneai.art/backgrounds/5a1dc3c9-a0ce-4de3-a166-6fbef98bb22a.mov"
          type="video/quicktime"
        />
      </video>
      {/* Subtle translucent dark gradient overlay allowing the video to clearly shine through */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030c07]/50 via-black/30 to-[#030c07]/80" />
    </div>
  )
}
