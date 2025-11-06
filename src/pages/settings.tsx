import { useSettingsStore } from "@/stores/settings-store"
import { CalculationMethod } from "adhan"
import React, { useState } from "react"

export default function SettingsPage() {
  const {
    calculationMethod,
    manualLocation,
    manualCoordinates,
    useManualLocation,
    setCalculationMethod,
    setManualLocation,
    setManualCoordinates,
    setUseManualLocation
  } = useSettingsStore()

  const [city, setCity] = useState(manualLocation)

  const handleSaveLocation = async () => {
    if (!city) return

    try {
      // Call OpenStreetMap Nominatim API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city
        )}`
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        setManualCoordinates({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        })
        setManualLocation(city)
        alert(`Location saved: ${city}`)
      } else {
        alert("City not found, try another one")
      }
    } catch (err) {
      alert("Failed to fetch location")
      console.error(err)
    }
  }

  return (
    <div className="p-4 w-80">
      <h1 className="text-lg font-bold mb-4">Prayer Settings</h1>

      {/* Calculation Method */}
      <label className="block mb-2 font-medium">Calculation Method</label>
      <select
        value={calculationMethod}
        onChange={(event) =>
          setCalculationMethod(
            event.target.value as keyof typeof CalculationMethod
          )
        }
        className="w-full mb-4 p-2 border rounded">
        {Object.keys(CalculationMethod).map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </select>

      {/* Manual Location */}
      <label className="block mb-2 font-medium">
        Manual Location (City/Town)
      </label>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        className="w-full mb-2 p-2 border rounded"
      />

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={useManualLocation}
          onChange={() => setUseManualLocation(!useManualLocation)}
        />
        Use Manual Location
      </label>

      <button
        onClick={handleSaveLocation}
        className="w-full p-2 bg-primary text-white rounded font-semibold">
        Save Settings
      </button>
    </div>
  )
}
