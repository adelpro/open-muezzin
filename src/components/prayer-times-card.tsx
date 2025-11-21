import { DIR } from "@/constants/direction"
import { WINDOW_MINUTES } from "@/constants/window-minutes"
import { cn } from "@/lib/cn"
import { useSettingsStore } from "@/stores/settings-store"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, PrayerTimes } from "adhan"
import type { Coordinates } from "adhan"
import { Clock, Moon, Star, Sun, SunDim, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

type PrayerTimesCardProps = {
  coordinates: Coordinates
}

if (WINDOW_MINUTES <= 0 || WINDOW_MINUTES > 120) {
  throw new Error(
    `WINDOW_MINUTES is invalid (${WINDOW_MINUTES}). Must be between 1 and 120.`
  )
}

export function PrayerTimesCard({ coordinates }: PrayerTimesCardProps) {
  const { calculationMethod, twentyFourHourFormat } = useSettingsStore()
  const method = CalculationMethod[calculationMethod]()

  const [now, setNow] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

  const icons: Record<string, JSX.Element> = {
    fajr: <Star size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <SunDim size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  // Calculate today prayer times
  const times: PrayerTimesData = useMemo(() => {
    const today = new Date()
    const pt = new PrayerTimes(coordinates, today, method)
    return {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha
    }
  }, [coordinates, method])

  // Build prayers list
  const prayers = useMemo(
    () =>
      prayerOrder.map((prayer) => ({
        id: prayer,
        name: chrome.i18n.getMessage(prayer),
        time: times[prayer as keyof PrayerTimesData] as Date
      })),
    [times]
  )

  // Determine current prayer inside window
  const currentPrayer =
    prayers.find((p) => {
      const start = new Date(p.time.getTime() - WINDOW_MINUTES * 60 * 1000)
      const end = new Date(p.time.getTime() + WINDOW_MINUTES * 60 * 1000)
      return now >= start && now <= end
    }) || null

  // Determine next prayer (after current, if any)
  const nextPrayer = currentPrayer
    ? prayers
        .slice(prayers.indexOf(currentPrayer) + 1)
        .find((p) => p.time > now) || null
    : prayers.find((p) => p.time > now) || null

  // Countdown formatter
  const getCountdown = (prayerTime: Date, isCurrent = false) => {
    let diffMs: number
    let prefix = ""

    if (isCurrent) {
      const start = new Date(prayerTime.getTime() - WINDOW_MINUTES * 60 * 1000)
      const end = new Date(prayerTime.getTime() + WINDOW_MINUTES * 60 * 1000)
      if (now < prayerTime) {
        diffMs = prayerTime.getTime() - now.getTime()
        prefix = "−"
      } else {
        diffMs = now.getTime() - prayerTime.getTime()
        prefix = "+"
      }
    } else {
      // next prayer
      diffMs = prayerTime.getTime() - now.getTime()
      prefix = "−"
    }

    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${prefix}${hours ? hours + "h " : ""}${minutes}m ${seconds
      .toString()
      .padStart(2, "0")}s`
  }

  return (
    <div className="mx-auto w-full max-w-sm" dir={DIR}>
      <div className="p-4 w-full text-gray-900 bg-white rounded-2xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <ul className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
          {prayerOrder.map((prayer) => {
            const time = times[prayer as keyof PrayerTimesData] as Date
            const isCurrent = currentPrayer?.id === prayer
            const isNext = nextPrayer?.id === prayer

            let timerDisplay = null
            if (isCurrent) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs text-white rounded-full shadow bg-primary">
                  {getCountdown(time, true)}
                </span>
              )
            } else if (isNext && nextPrayer) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs rounded-full bg-accent/20 text-accent">
                  {getCountdown(nextPrayer.time)}
                </span>
              )
            }

            return (
              <li
                key={prayer}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-xl transition-colors",
                  isCurrent &&
                    "font-semibold shadow-sm bg-primary/10 text-primary ring-1 ring-primary"
                )}>
                <div className="flex gap-2 items-center capitalize">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{chrome.i18n.getMessage(prayer)}</span>
                </div>

                <span className="flex flex-1 justify-center">
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
