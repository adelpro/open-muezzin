import "@/styles.css"

// import AdhenPlayer from "@/components/adhen-player"
import { Footer } from "@/components/footer"
import { FooterSkeleton } from "@/components/footer-skeleton"
import { Header } from "@/components/header"
import { PrayerTimesCard } from "@/components/prayer-times-card"
import { PrayerTimesSkeleton } from "@/components/prayer-times-skeleton"
import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { useLocation } from "@/hooks/use-location"
import { useSettingsStore } from "@/stores/settings-store"

export default function IndexPopup() {
  // select only autoLocation so the popup doesn't re-render for unrelated store changes
  const autoLocation = useSettingsStore((s) => s.autoLocation)

  const {
    coordinates,
    loadingCoordinates,
    address,
    status,
    error,
    requestLocation
  } = useLocation(COORDINATES_FALLBACK)

  return (
    <div className="flex flex-col items-center justify-center w-[600px] h-[600px]">
      <Header />
      {/* TODO add Adhan Player */}
      {/* <AdhenPlayer /> */}
      {(status === "loading" || loadingCoordinates) && <PrayerTimesSkeleton />}
      {status === "ready" && !loadingCoordinates ? (
        <>
          <PrayerTimesCard coordinates={coordinates} />
          <Footer
            autoLocation={autoLocation}
            status={status}
            address={address}
            coordinates={coordinates}
          />
        </>
      ) : (
        <FooterSkeleton />
      )}

      {status === "idle" && !loadingCoordinates && (
        <div className="text-center">
          <p className="text-gray-300">
            Location access is required to show accurate prayer times.
          </p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 mt-4 text-white rounded transition bg-primary-600 hover:bg-primary-500">
            Allow Location Access
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() =>
              chrome.tabs.create({ url: "chrome://settings/content/location" })
            }
            className="mt-2 text-sm text-blue-400 underline">
            Open Location Settings
          </button>
        </div>
      )}
    </div>
  )
}
