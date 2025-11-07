import { CalculationMethod } from "adhan"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Coordinates = {
  latitude: number
  longitude: number
}

type Location = {
  address: string
  coordinates: Coordinates
}

export type SettingsState = {
  calculationMethod: keyof typeof CalculationMethod
  manualLocation?: Location
  cachedLocation?: Location
  autoLocation: boolean
  twentyFourHourFormat?: boolean

  setCalculationMethod: (method: keyof typeof CalculationMethod) => void
  setManualLocation: (location: {
    address: string
    coordinates: Coordinates
  }) => void
  setCachedLocation: (location: {
    address: string
    coordinates: Coordinates
  }) => void
  setAutoLocation: (value: boolean) => void
  setTwentyFourHourFormat: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      calculationMethod: "MuslimWorldLeague",
      manualLocation: undefined,
      cachedLocation: undefined,
      autoLocation: true,
      twentyFourHourFormat: false,

      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setManualLocation: (location: Location) =>
        set({ manualLocation: location }),
      setCachedLocation: (location: Location) =>
        set({ cachedLocation: location }),
      setAutoLocation: (value) => set({ autoLocation: value }),
      setTwentyFourHourFormat: (value) => set({ twentyFourHourFormat: value })
    }),
    {
      name: "open-muezzin-settings"
    }
  )
)
