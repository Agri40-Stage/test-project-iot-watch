const fetchPrediction = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/predict");
    if (!response.ok) throw new Error("Prediction fetch failed");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return null;
  }
};

export default fetchPrediction;
