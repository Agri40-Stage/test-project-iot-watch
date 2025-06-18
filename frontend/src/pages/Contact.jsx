import React, { useState } from "react";
import Header from "../components/Header";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      {/* Contenu centré et limité en largeur */}
      <div className="max-w-md mx-auto p-4 mt-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Contact Us</h1>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-white" htmlFor="name">
                Name
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-white" htmlFor="email">
                Email
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-white" htmlFor="message">
                Message
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Send
            </button>
          </form>
        ) : (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            Thank you for contacting us! We will get back to you soon.
          </div>
        )}
      </div>
    </div>
  );
}

export default Contact;