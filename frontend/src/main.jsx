import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./index.css";

const preferredTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

document.documentElement.classList.toggle("dark", preferredTheme === "dark");
document.body.classList.toggle("dark", preferredTheme === "dark");

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>,
);