// background/prayer-badge.ts
import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"

// === CONFIG ===
const BADGE_COLOR = "#22c55e" // green
const CURRENT_WINDOW_MINUTES = 15
const CHECK_INTERVAL_MINUTES = 1 // run every 1 minute

// Helper: show badge
function showBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return

  try {
    action.setBadgeBackgroundColor({ color: BADGE_COLOR }) // green
    action.setBadgeText({ text: "●" }) // single dot
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
  const prayers: Date[] = [
    prayerTimes.fajr,
    prayerTimes.dhuhr,
    prayerTimes.asr,
    prayerTimes.maghrib,
    prayerTimes.isha
  ]

  const isWithinWindow = prayers.some(
    (time) =>
      Math.abs(now.getTime() - time.getTime()) <=
      CURRENT_WINDOW_MINUTES * 60 * 1000
  )

  if (isWithinWindow) {
    showBadge()
    chrome.alarms.create("hidePrayerBadge", {
      delayInMinutes: CURRENT_WINDOW_MINUTES
    })
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
