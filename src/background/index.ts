import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { CURRENT_WINDOW_MINUTES } from "@/constants/current-window-minutes"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"

// === CONFIG ===
const BADGE_COLOR = "#34d3c3" // green
const CHECK_INTERVAL_MINUTES = 1 // run every minute

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const

// Helper: show badge
function showBadge(text: string) {
  const action = chrome.action || chrome.browserAction
  if (!action) return

  try {
    action.setBadgeBackgroundColor({ color: BADGE_COLOR })
    action.setBadgeText({ text })
  } catch (err) {
    console.warn("Badge not supported", err)
  }
}

// Helper: hide badge
function hideBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return

  try {
    action.setBadgeText({ text: "" })
  } catch (err) {
    console.warn("Failed to hide badge", err)
  }
}

// Main function
async function updatePrayerBadge() {
  const now = new Date()
  const coordinates: Coordinates = COORDINATES_FALLBACK
  const method = CalculationMethod.MuslimWorldLeague()
  const prayerTimes = new PrayerTimes(coordinates, now, method)

  const prayers = PRAYER_ORDER.map((name) => ({
    name,
    time: prayerTimes[name as keyof typeof prayerTimes] as Date
  }))

  // Find the closest prayer within ±CURRENT_WINDOW_MINUTES
  const currentPrayer = prayers.find((prayer) => {
    const windowEnd = new Date(
      prayer.time.getTime() + CURRENT_WINDOW_MINUTES * 60 * 1000
    )
    return now >= prayer.time && now <= windowEnd
  })

  if (currentPrayer) {
    const diff = now.getTime() - currentPrayer.time.getTime()
    const prefix = diff < 0 ? "−" : "+"
    const minutes = Math.floor(Math.abs(diff) / 60000)
    showBadge(`${prefix}${minutes}`)
    chrome.alarms.create("hidePrayerBadge", { delayInMinutes: 1 })
  } else {
    hideBadge()
  }

  if (currentPrayer) {
    const diffMinutes = Math.round(
      (now.getTime() - currentPrayer.time.getTime()) / (60 * 1000)
    )
    showBadge(`${diffMinutes >= 0 ? "+" : ""}${diffMinutes}`) // e.g., -15 to +15
    chrome.alarms.create("hidePrayerBadge", {
      delayInMinutes: 1 // update every minute
    })
  } else {
    hideBadge()
  }
}

// === Alarms ===
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrayerBadge") updatePrayerBadge()
  else if (alarm.name === "hidePrayerBadge") hideBadge()
})

// Run immediately
updatePrayerBadge()

// Periodic check
chrome.alarms.create("checkPrayerBadge", {
  periodInMinutes: CHECK_INTERVAL_MINUTES
})
