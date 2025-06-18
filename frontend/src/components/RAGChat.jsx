import React, { useState, useEffect, useRef } from "react";
import { askRAG } from "../api/rag";
import { MessageCircle } from "lucide-react";

const RAGChat = () => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    // Ajoute le message de l'utilisateur
    setChatHistory((prev) => [...prev, { type: "user", content: question }]);
    setLoading(true);
    setQuestion("");

    // Appelle l'API pour obtenir la réponse de l'IA
    const result = await askRAG(question);

    // Ajoute la réponse de l'IA
    setChatHistory((prev) => [...prev, { type: "bot", content: result }]);
    setLoading(false);
  };

  // Scroll auto vers le bas quand l'historique change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  return (
    <>
      {/* Bouton flottant d'ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded shadow-lg flex flex-col border border-green-200 z-50">
          {/* En-tête */}
          <div className="p-4 border-b bg-green-600 text-white font-bold rounded-t flex justify-between items-center">
            FellahGPT
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Contenu du chat */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 max-h-96"
          >
            {/* Bloc de description */}
            {chatHistory.length === 0 && !loading && (
              <div className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg mb-4 border border-green-100">
                <p className="font-semibold text-green-700">Bienvenue sur FellahGPT 🌾</p>
                <p>
                  Cet assistant intelligent vous aide à répondre à vos questions sur
                  l’agriculture marocaine : <strong>cultures, irrigation, maladies, pratiques agricoles</strong>…
                </p>
                <p className="mt-1 text-green-600 italic">
                  Posez-lui une question pour commencer.
                </p>
              </div>
            )}

            {/* Affichage des messages */}
            {chatHistory.map((entry, index) => (
              <div
                key={index}
                className={`flex ${entry.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-[75%] ${
                    entry.type === "user"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-xl text-sm max-w-[75%] bg-green-50 text-green-900 italic">
                  FellahGPT est en train de répondre...
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-3 border-t flex items-center gap-2 bg-green-50">
            <input
              type="text"
              className="flex-1 p-2 border rounded text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Pose ta question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <button
              onClick={handleAsk}
              disabled={!question || loading}
              className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 text-sm"
            >
              {loading ? "..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RAGChat;
