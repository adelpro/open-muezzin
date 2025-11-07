import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"

// === CONFIG ===
const BADGE_COLOR = "#22c55e" // green
const CURRENT_WINDOW_MINUTES = 15 // 15 minutes around prayer time
const CHECK_INTERVAL_MINUTES = 1 // run every minute

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const

const PRAYER_ARABIC: Record<string, string> = {
  fajr: "ف",
  dhuhr: "ظ", // or "ذ" if you prefer
  asr: "ع",
  maghrib: "م",
  isha: "ش"
}

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

  const currentPrayer = prayers.find(
    ({ time }) =>
      Math.abs(now.getTime() - time.getTime()) <=
      CURRENT_WINDOW_MINUTES * 60 * 1000
  )

  if (currentPrayer) {
    showBadge(PRAYER_ARABIC[currentPrayer.name])
    chrome.alarms.create("hidePrayerBadge", {
      delayInMinutes: CURRENT_WINDOW_MINUTES
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
