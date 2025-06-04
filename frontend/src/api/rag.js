export const askRAG = async (question, history = []) => {
  try {
    const response = await fetch("http://localhost:2000/api/agriculture-query", {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: question,
        history //il rappele seulement les trois dernier interaaction 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "No response from server";
  } catch (error) {
    console.error("Error calling RAG API:");
    return "⚠️ Sorry, I couldn't process your request. Please try again later.";
  }
};