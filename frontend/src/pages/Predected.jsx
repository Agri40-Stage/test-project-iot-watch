import React from "react";
import PredictedChart from "../components/PredictedTemperatureChart"; // adjust if needed
import Header from "../components/Header";
const Predicted = () => {
  //   return (
  //     <div className="p-4">
  //       <h1 className="text-2xl font-bold mb-4">Predicted Temperature</h1>

  //     </div>
  //   );
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <div className="flex justify-center items-center">
        <PredictedChart />
      </div>
    </div>
  );
};

export default Predicted;
