import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { Clock, Compass, Moon, Sun, Sunrise, Sunset } from "lucide-react"
import React from "react"

type PrayerTimesCardProps = {
  times: PrayerTimesData
  location: string
  date: string
  coordinates: { latitude: number; longitude: number }
}

export function PrayerTimesCard({
  times,
  location,
  date,
  coordinates
}: PrayerTimesCardProps) {
  const icons: Record<string, JSX.Element> = {
    fajr: <Moon size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <Clock size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 text-gray-900 dark:text-gray-100">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 mb-4">
          {Object.entries(times).map(([key, value]) => (
            <li
              key={key}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 capitalize">
                {icons[key] || <Clock size={18} />}
                <span className="font-medium">{key}</span>
              </div>
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                {new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>{" "}
      <footer className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500">
        {location} • {date}
      </footer>
    </>
  )
}
