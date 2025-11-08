import { cn } from "@/lib"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import adhanSound from "url:~/assets/first_adhan_masjid_aadam.ogg"

import PulsatingDots from "./pulsating-dots"

export default function AdhanPlayer() {
  const audio = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const element = audio.current
    if (!element) return

    element.volume = 0.8
    element.onended = () => setIsPlaying(false)
    element.play().catch(() => setIsPlaying(false))
  }, [])

  const handleStop = () => {
    const element = audio.current
    if (!element) return
    element.pause()
    element.currentTime = 0
    setIsPlaying(false)
  }

  if (!isPlaying) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 w-[90%] max-w-md",
        isPlaying ? "animate-fade-in-up" : "animate-fade-out-down"
      )}>
      <audio ref={audio} src={adhanSound} />
      <div className="flex gap-3 justify-between items-center px-4 py-3 w-full rounded-2xl ring-1 shadow-md ring-primary-400 bg-card-400/10">
        <div className="flex gap-2 items-center">
          <PulsatingDots />
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Adhan is playing
          </span>
        </div>
        <button
          onClick={handleStop}
          aria-label="Stop Adhan"
          className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
