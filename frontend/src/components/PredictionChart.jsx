import React,{
    useEffect, useState
} from "react";

import { LineChart,Line, XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from "recharts";
export default function PredictionChart(){
    const [data,setData] = useState([]);
    useEffect(()=>{
        fetch("http://localhost:5000/api/predictions")
        .then((res) => res.json())
        .then((result) => {
            setData(result);
        })
        .catch((error) => {
            console.error("Error fetching prediction:",error);
        });
    },[]);
    return(
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-3">
                Temperature Prediction for Next 24 Hours
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour"/>
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
