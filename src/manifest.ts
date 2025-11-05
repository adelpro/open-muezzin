const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "Open Muezzin",
  version: "0.0.1",
  description:
    "Open-source Adhan extension with accurate prayer times, no tracking, and offline support.",
  permissions: ["alarms", "storage", "geolocation", "notifications"],
  background: {
    service_worker: "background.ts"
  },
  icons: {
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  host_permissions: ["https://*/*"]
}

export default manifest
