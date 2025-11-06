import { cn } from "@/lib/cn"
import { useSettingsStore } from "@/stores/settings-store"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"
import { Clock, Moon, Sun, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

type PrayerTimesCardProps = {
  location: string
  date: string
  coordinates: Coordinates
  currentWindowMinutes?: number
}

export function PrayerTimesCard({
  location,
  date,
  coordinates,
  currentWindowMinutes = 15
}: PrayerTimesCardProps) {
  const { calculationMethod, manualLocation, autoLocation } = useSettingsStore()
  const method = CalculationMethod[calculationMethod]()

  const icons: Record<string, JSX.Element> = {
    fajr: <Moon size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <Clock size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const activeCoordinates: Coordinates = autoLocation
    ? coordinates
    : manualLocation?.coordinates || coordinates

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

  let currentPrayer: { name: string; time: Date } | null = null
  let nextPrayer: { name: string; time: Date } | null = null

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i]
    const windowEnd = new Date(
      prayer.time.getTime() + currentWindowMinutes * 60 * 1000
    )
    if (now >= prayer.time && now <= windowEnd) {
      currentPrayer = prayer
      nextPrayer = prayers[i + 1] || prayers[0]
      break
    }
    if (prayer.time > now && !nextPrayer) {
      nextPrayer = prayer
      break
    }
  }

  if (!currentPrayer && !nextPrayer) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    nextPrayer = {
      name: "fajr",
      time: new PrayerTimes(activeCoordinates, tomorrow, method).fajr
    }
  }

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
    <>
      <div className="p-4 w-full text-gray-900 bg-white rounded-2xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
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
                <div className="flex gap-2 items-center w-20 capitalize">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{prayer}</span>
                </div>

                <div className="flex flex-1 justify-center">{timerDisplay}</div>

                <span className="w-16 font-mono text-right text-gray-700 dark:text-gray-300">
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="mt-3 text-xs text-center text-gray-500 dark:text-gray-500">
        {autoLocation
          ? location
          : manualLocation?.city
            ? `${manualLocation.city} (manual)`
            : location}{" "}
        • {date}
      </footer>
    </>
  )
}
