import React from "react";

/* Components */
import Content from "../components/Content";
import Header from "../components/Header";
import TemperaturePrediction from "../components/TemperaturePrediction";
import WeeklyStats from "../components/WeeklyStats";

function Temperature() {
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        <Content />
        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-2">
          <WeeklyStats />
          <TemperaturePrediction />
        </div>
      </main>
    </div>
  );
}

export default Temperature;
