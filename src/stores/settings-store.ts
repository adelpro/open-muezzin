import { CalculationMethod } from "adhan"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { extensionStorage } from "./extention-storage";


type Coordinates = { latitude: number; longitude: number }
type Location = { address: string; coordinates: Coordinates }

export type SettingsState = {
  calculationMethod: keyof typeof CalculationMethod
  manualLocation?: Location
  autoLocation: boolean
  twentyFourHourFormat?: boolean
  cachedCoordinates?: Coordinates

  setCalculationMethod: (method: keyof typeof CalculationMethod) => void
  setManualLocation: (location: Location) => void
  setAutoLocation: (value: boolean) => void
  setTwentyFourHourFormat: (value: boolean) => void
  setCachedCoordinates: (coords: Coordinates) => void

}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      calculationMethod: "MuslimWorldLeague",
      manualLocation: undefined,
      autoLocation: true,
      twentyFourHourFormat: false,
      cachedCoordinates: undefined,


      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setManualLocation: (location) => set({ manualLocation: location }),
      setAutoLocation: (value) => set({ autoLocation: value }),
      setTwentyFourHourFormat: (value) => set({ twentyFourHourFormat: value }),
      setCachedCoordinates: (coords) => set({ cachedCoordinates: coords }),

    }),
    {
      name: "open-muezzin-settings",
      storage: createJSONStorage(() => extensionStorage),
    }
  )
)
