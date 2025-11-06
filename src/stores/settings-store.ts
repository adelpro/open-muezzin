import { CalculationMethod } from "adhan"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Coordinates = {
  latitude: number
  longitude: number
}

type Location = {
  city: string
  coordinates: Coordinates
}

export type SettingsState = {
  calculationMethod: keyof typeof CalculationMethod
  manualLocation?: Location
  autoLocation: boolean

  setCalculationMethod: (method: keyof typeof CalculationMethod) => void
  setManualLocation: (location: {
    city: string
    coordinates: Coordinates
  }) => void
  setAutoLocation: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      calculationMethod: "MuslimWorldLeague",
      manualLocation: undefined,
      autoLocation: true,

      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setManualLocation: (location) => set({ manualLocation: location }),
      setAutoLocation: (value) => set({ autoLocation: value })
    }),
    {
      name: "open-muezzin-settings"
    }
  )
)
