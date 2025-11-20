import "@/styles.css"

import { DIR } from "@/constants/direction"
import { debounceAsync } from "@/lib/debounce-async"
import { searchCity, type NominatimResult } from "@/lib/location-service"
import { useSettingsStore } from "@/stores/settings-store"
import { CalculationMethod } from "adhan"
import React, { useCallback, useEffect, useState } from "react"
import Logo from "url:~/assets/icon512.png"

export default function Options() {
  const {
    calculationMethod,
    manualLocation,
    autoLocation,
    setCalculationMethod,
    setManualLocation,
    setAutoLocation,
    twentyFourHourFormat,
    setTwentyFourHourFormat
  } = useSettingsStore()

  const [cityInput, setCityInput] = useState(manualLocation?.address || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<NominatimResult[] | null>(
    null
  )

  const performSearch = useCallback(
    async (searchQuery: string, signal?: AbortSignal) => {
      if (!searchQuery) {
        setSearchResults(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await searchCity(searchQuery, signal)
        setSearchResults(data.length > 0 ? data : [])
      } catch (error) {
        if (signal?.aborted) return
        setError("Failed to fetch location suggestions.")
        setSearchResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const debouncedSearch = debounceAsync(performSearch, 500)

  useEffect(() => {
    if (!autoLocation && cityInput && cityInput !== manualLocation?.address) {
      debouncedSearch(cityInput)
    } else {
      setSearchResults(null)
    }
  }, [cityInput, manualLocation, autoLocation])

  useEffect(() => {
    if (autoLocation) return
    if (manualLocation?.address) {
      setCityInput(manualLocation.address)
    }
  }, [manualLocation?.address, autoLocation])

  const handleSelectLocation = (result: NominatimResult) => {
    setManualLocation({
      address: result.display_name,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }
    })
    setCityInput(result.display_name)
    setSearchResults(null)
    setSuccess(
      `Location saved successfully: ${result.display_name.split(",")[0]}`
    )
    setError(null)
  }

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [success, error])

  return (
    <div
      className="flex flex-col w-full text-gray-800 bg-gray-50 min-h-svh"
      dir={DIR}>
      {/* Header */}
      <header className="flex gap-3 items-center px-5 py-4 bg-white shadow-sm">
        <img src={Logo} alt="Open Muezzin" className="w-9 h-9 rounded-md" />
        <h1 className="text-xl font-semibold">
          {chrome.i18n.getMessage("optionsTitle")}
        </h1>
      </header>

      {/* Main */}
      <main className="flex flex-col gap-8 px-5 py-6 mx-auto w-full max-w-md">
        {/* SECTION: Calculation */}
        <section className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-sm">
          <label className="font-medium">
            {chrome.i18n.getMessage("calculationMethod")}
          </label>

          <select
            value={calculationMethod}
            onChange={(event) =>
              setCalculationMethod(
                event.target.value as keyof typeof CalculationMethod
              )
            }
            className="p-2 w-full bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
            {Object.entries(CalculationMethod).map(([key]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <label className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={twentyFourHourFormat}
              onChange={() => setTwentyFourHourFormat(!twentyFourHourFormat)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600"
            />
            {chrome.i18n.getMessage("use24HourFormat")}
          </label>
        </section>

        {/* SECTION: Location */}
        <section className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-sm">
          <label className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={autoLocation}
              onChange={() => setAutoLocation(!autoLocation)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600"
            />
            {chrome.i18n.getMessage("useAutoLocation")}
          </label>

          {!autoLocation && (
            <div className="flex relative flex-col gap-1">
              <label className="font-medium">
                {chrome.i18n.getMessage("manualLocationCity")}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(event) => {
                    setCityInput(event.target.value)
                    setError(null)
                    setSuccess(null)
                  }}
                  placeholder={chrome.i18n.getMessage("enterCityName")}
                  className="p-2 pr-9 w-full bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                />

                {isLoading && (
                  <span className="absolute right-2 top-1/2 w-3 h-3 rounded-full border-2 animate-spin -translate-y-1/2 border-primary-500 border-t-transparent" />
                )}
              </div>

              {(!autoLocation && searchResults) || isLoading ? (
                <div className="absolute right-0 left-0 top-20 z-20 bg-white rounded-lg border border-gray-200 shadow-lg">
                  {isLoading ? (
                    <p className="flex gap-2 items-center p-3 text-sm text-gray-500">
                      <span className="w-3 h-3 rounded-full border-2 animate-spin border-primary-500 border-t-transparent" />
                      {chrome.i18n.getMessage("Searching")}
                    </p>
                  ) : searchResults && searchResults.length > 0 ? (
                    <ul className="overflow-y-auto max-h-60">
                      {searchResults.map((result, index) => (
                        <li
                          key={result.lat + result.lon + index}
                          onClick={() => handleSelectLocation(result)}
                          className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100">
                          {result.display_name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-3 text-sm text-gray-500">
                      {chrome.i18n.getMessage("noResultsFound")} "{cityInput}"
                    </p>
                  )}
                </div>
              ) : null}

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              {success && (
                <p className="mt-1 text-sm text-green-600">{success}</p>
              )}
            </div>
          )}
        </section>

        <p className="text-sm text-center text-gray-400">
          {chrome.i18n.getMessage("poweredBy")}
        </p>
      </main>

      {/* Footer */}
      <footer className="py-5 mt-auto">
        <div className="flex gap-5 justify-center text-sm text-gray-600">
          <a
            href="https://github.com/adelpro/open-muezzin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 hover:underline">
            {chrome.i18n.getMessage("githubRepo")}
          </a>

          <a
            href="https://openmuezzin.adelpro.us.kg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 hover:underline">
            {chrome.i18n.getMessage("extensionHome")}
          </a>

          <a
            href={chrome.runtime.getURL("privacy.html")}
            className="hover:text-primary-600 hover:underline">
            {chrome.i18n.getMessage("privacyPolicy")}
          </a>
        </div>
      </footer>
    </div>
  )
}
