/* Components */
import React from "react"
import Content from "../components/Content"
import Header from "../components/Header"
import TemperaturePrediction from "../components/TemperaturePrediction"
import WeeklyStatsEnhanced from "../components/WeeklyStatsEnhanced"

function Temperature() {
  return (
    <div className="w-screen px-4 min-h-screen bg-zinc-50">
      <Header />
      <Content />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyStatsEnhanced />
          {/* <TemperaturePrediction /> */}
        </div>
      </div>
    </div>
  )
}

export default Temperature
