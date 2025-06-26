import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';

const BotInsight = () => {
  const [insight, setInsight] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch AI-generated temperature insight from backend
  const fetchInsight = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API to get AI insight
      const response = await fetch(`${API_BASE_URL}/api/gemini-insight`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setInsight(data.insight || "");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      // Retry after 2 seconds if fetch fails
      setTimeout(fetchInsight, 2000);
    }
  };

  useEffect(() => {
    // Delay initial fetch to ensure backend is ready
    const timer = setTimeout(fetchInsight, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Theme detection for dark/light mode
    const checkDark = () => setIsDark(document.body.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-between py-6 px-6 rounded-xl border border-gray-200 dark:border-zinc-700 h-[400px] shadow-sm bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Today's AI-Generated Insight</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-500">Generating AI insight...</div>
        </div>
        <div className="text-sm text-right text-gray-400 dark:text-gray-500 font-medium mt-4">Powered by Gemini AI</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-between py-6 px-6 rounded-xl border border-gray-200 dark:border-zinc-700 h-[400px] shadow-sm bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Today's AI-Generated Insight</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-red-500 text-center">
            <div>Error generating insight</div>
            <div className="text-base">{error}</div>
          </div>
        </div>
        <div className="text-sm text-right text-gray-400 dark:text-gray-500 font-medium mt-4">Powered by Gemini AI</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between py-6 px-6 rounded-xl border border-gray-200 dark:border-zinc-700 h-[400px] shadow-sm bg-white dark:bg-zinc-900 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Today's AI-Generated Insight</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <p className="text-base text-gray-500 dark:text-gray-400 mb-3 ml-2">AI analyzes current and recent temperature data to generate a concise daily insight highlighting trends and anomalies.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm border border-blue-100 dark:border-blue-800">
            <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-100">
              {insight}
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-right text-gray-400 dark:text-gray-500 font-medium mt-4">Powered by Gemini AI</div>
    </div>
  );
};

export default BotInsight; 