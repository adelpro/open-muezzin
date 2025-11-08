import { BADGE_WINDOW_MINUTES } from "@/constants/badge-window-minutes"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"

const BADGE_COLOR = "#34d3c3"
const CHECK_INTERVAL_MINUTES = 1
const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const

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

function hideBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return
  try {
    action.setBadgeText({ text: "" })
  } catch (err) {
    console.warn("Failed to hide badge", err)
  }
}

// Coordinates
const getCoordinates = async (): Promise<Coordinates | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("open-muezzin-settings", (result) => {
      const settingsRaw = result["open-muezzin-settings"];
      if (!settingsRaw) return resolve(null);

      try {
        const settings = JSON.parse(settingsRaw);
        const coords = settings.state?.cachedCoordinates ?? null;
        resolve(coords);
      } catch (err) {
        console.error("Failed to parse settings", err);
        resolve(null);
      }
    });
  });

}

// Prayer Check
async function updatePrayerBadge() {
  const now = new Date()
  const coordinates = await getCoordinates()

  if (!coordinates) {
    hideBadge()
    return
  }

  const method = CalculationMethod.MuslimWorldLeague()
  const prayerTimes = new PrayerTimes(coordinates, now, method)

  const prayers = PRAYER_ORDER.map((name) => ({
    name,
    time: prayerTimes[name as keyof typeof prayerTimes] as Date
  }))

  const closestPrayer = prayers.find((prayer) => {
    const diffMinutes = (prayer.time.getTime() - now.getTime()) / 60000
    return Math.abs(diffMinutes) <= BADGE_WINDOW_MINUTES
  })

  if (closestPrayer) {
    const diffMinutes = Math.floor(
      (closestPrayer.time.getTime() - now.getTime()) / 60000
    )
    showBadge(`${diffMinutes >= 0 ? "-" : "+"}${Math.abs(diffMinutes)}`)

    // TODO Fire notification exactly at prayer time

    /*     console.log("Prayer time notification fired")
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/icon512.png"),
          title: "Prayer Time",
          message: `It's time for ${closestPrayer.name} prayer`,
          priority: 2
        }) */



  } else {
    hideBadge()
  }
}

//Storage Change Listener
// Storage listener: only triggers on coordinates change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return
  const change = changes["open-muezzin-settings"]
  if (!change) return

  try {
    const oldCoords = change.oldValue?.state?.cachedCoordinates
    const newCoords = change.newValue?.state?.cachedCoordinates
    if (JSON.stringify(oldCoords) !== JSON.stringify(newCoords)) {
      updatePrayerBadge()
    }
  } catch {
    // ignore parse errors
  }
})

// Interval Update
chrome.alarms.create("checkPrayerBadge", {
  periodInMinutes: CHECK_INTERVAL_MINUTES
})

// Alarm Check
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrayerBadge") updatePrayerBadge()
})

// Initial check
updatePrayerBadge()
