import { cn } from "@/lib"
import { useSettingsStore } from "@/stores/settings-store"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import adhanSound from "url:~/assets/adhan-alger.ogg"

import PulsatingDots from "./pulsating-dots"

export default function AdhanPlayer() {
  const audio = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPrayer, setCurrentPrayer] = useState<string>("")
  const [unlocked, setUnlocked] = useState(false)
  const { playAdhan } = useSettingsStore()

  // Unlock audio context on first user gesture
  const unlockAudio = () => {
    if (unlocked) return
    const element = audio.current
    if (!element) return
    element.volume = 0
    element.play().finally(() => {
      element.pause()
      element.currentTime = 0
      element.volume = 0.8
      setUnlocked(true)
    })
  }

  useEffect(() => {
    const handlePrayerTime = (msg: any) => {
      if (msg.type === "PRAYER_TIME") {
        const element = audio.current
        if (!element) return
        if (!unlocked) {
          console.warn("Audio context not unlocked yet")
          return
        }
        element.currentTime = 0
        element.volume = 0.8
        element.play().catch(console.error)
        setIsPlaying(true)
        setCurrentPrayer(msg.prayer)
      }
    }

    chrome.runtime.onMessage.addListener(handlePrayerTime)

    return () => chrome.runtime.onMessage.removeListener(handlePrayerTime)
  }, [unlocked])

  const handleStop = () => {
    const element = audio.current
    if (!element) return
    element.pause()
    element.currentTime = 0
    setIsPlaying(false)
  }

  // Don't render anything until user enables Adhan
  if (!playAdhan) return null

  // Only render the player UI when playing
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
            Adhan of {currentPrayer} is playing
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStop}
            aria-label="Stop Adhan"
            className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
            <X size={16} />
          </button>
          {!unlocked && (
            <button
              onClick={unlockAudio}
              className="px-2 py-1 text-xs text-white rounded bg-primary-600 hover:bg-primary-700">
              Unlock Audio
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
