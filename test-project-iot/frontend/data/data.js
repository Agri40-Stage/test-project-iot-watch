const lineChart = {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
        {
            label: "Humidity Agadir",
            data: [45, 50, 55, 60, 52, 48, 53, 57, 49, 51],
            borderColor: "#36A2EB",
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            borderWidth: 2,
            tension: 0.4,
        },
        {
            label: "Humidity Ouarzazate",
            data: [12, 10, 20, 33, 8, 15, 3, 16, 24, 16],
            borderColor: "#4BC0C0",
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            fill: true,
            borderWidth: 2,
            tension: 0.4,
        },
    ],
}

export default lineChart;
