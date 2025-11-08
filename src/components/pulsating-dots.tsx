import React from "react"

export default function PulsatingDots() {
  return (
    <div className="flex relative w-3 h-3">
      <span className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping bg-primary-500" />
      <span className="inline-flex relative w-3 h-3 rounded-full bg-primary-500" />
    </div>
  )
}
