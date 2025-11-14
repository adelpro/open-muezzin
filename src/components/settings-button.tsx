import { Settings } from "lucide-react"

export default function SettingsButton() {
  const settingsUrl = chrome.runtime.getURL("options.html")
  return (
    <div className="flex justify-center items-center">
      <button
        type="button"
        className="p-2 m-2"
        onClick={() => chrome.tabs.create({ url: settingsUrl })}>
        <Settings size={20} />
      </button>
    </div>
  )
}
