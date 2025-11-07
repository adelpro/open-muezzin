import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { useLocation } from "@/hooks/use-location"
import { cn } from "@/lib/cn"
import { useSettingsStore } from "@/stores/settings-store"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"
import { Clock, Moon, Sun, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

type PrayerTimesCardProps = {
  currentWindowMinutes?: number
}

export function PrayerTimesCard({
  currentWindowMinutes = 15
}: PrayerTimesCardProps) {
  const {
    calculationMethod,
    manualLocation,
    autoLocation,
    twentyFourHourFormat
  } = useSettingsStore()
  const { coordinates } = useLocation(COORDINATES_FALLBACK)
  const method = CalculationMethod[calculationMethod]()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const activeCoordinates: Coordinates = autoLocation
    ? coordinates
    : manualLocation?.coordinates || coordinates

  const icons: Record<string, JSX.Element> = {
    fajr: <Moon size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <Clock size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

  const times: PrayerTimesData = useMemo(() => {
    const today = new Date()
    const prayerTimes = new PrayerTimes(activeCoordinates, today, method)
    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha
    }
  }, [activeCoordinates, method])

  const prayers = useMemo(() => {
    const list = prayerOrder.map((prayer) => ({
      name: prayer,
      time: times[prayer as keyof PrayerTimesData] as Date
    }))
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    list.push({
      name: "fajr",
      time: new PrayerTimes(activeCoordinates, tomorrow, method).fajr
    })
    return list
  }, [times, activeCoordinates, method])

  const currentPrayer =
    prayers.find((prayer) => {
      const windowEnd = new Date(
        prayer.time.getTime() + currentWindowMinutes * 60 * 1000
      )
      return now >= prayer.time && now <= windowEnd
    }) || null

  const nextPrayer = currentPrayer
    ? prayers[prayers.indexOf(currentPrayer) + 1] || prayers[0]
    : prayers.find((prayer) => prayer.time > now) || prayers[0]

  const getCountdown = (target: Date) => {
    const diffMs = target.getTime() - now.getTime()
    if (diffMs <= 0) return "0m 00s"
    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    return [
      hours > 0 ? `${hours}h` : "",
      `${minutes}m`,
      `${seconds.toString().padStart(2, "0")}s`
    ]
      .filter(Boolean)
      .join(" ")
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="w-full p-4 text-gray-900 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <ul className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
          {prayerOrder.map((prayer) => {
            const time = times[prayer as keyof PrayerTimesData] as Date
            const isCurrent = currentPrayer?.name === prayer
            const isNext = nextPrayer?.name === prayer
            const prayerTime = time.getTime()
            const diff = now.getTime() - prayerTime
            const withinWindow =
              Math.abs(diff) <= currentWindowMinutes * 60 * 1000
            const prefix = diff < 0 ? "−" : "+"

            let timerDisplay = null
            if (withinWindow) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs text-white rounded-full shadow bg-primary">
                  {prefix}
                  {getCountdown(
                    new Date(
                      prayerTime +
                        (diff < 0 ? 0 : currentWindowMinutes * 60 * 1000)
                    )
                  )}
                </span>
              )
            } else if (isNext) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs rounded-full bg-accent/20 text-accent">
                  −{getCountdown(nextPrayer!.time)}
                </span>
              )
            }

            return (
              <li
                key={prayer}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-xl transition-colors",
                  isCurrent &&
                    "font-semibold ring-1 shadow-sm bg-primary/10 text-primary ring-primary/20"
                )}>
                <div className="flex items-center gap-2 capitalize">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{prayer}</span>
                </div>

                <span className="flex justify-center flex-1">
                  {timerDisplay}
                </span>

                <span className="font-mono text-right text-gray-700">
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: !twentyFourHourFormat
                  })}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
