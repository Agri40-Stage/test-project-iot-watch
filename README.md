# 🌡️ AGRI 4.0 - Smart Agriculture Watch System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Stack](https://img.shields.io/badge/Tech-Python%20Flask%20%7C%20React%20Vite-blue)
![Design](https://img.shields.io/badge/UI-Dark%20Mode%20%7C%20Glassmorphism-purple)
![Focus](https://img.shields.io/badge/Domain-AgriTech%20IoT-green)

## 📌 Project Overview

**AGRI 4.0** is a cutting-edge Smart Agriculture Watch System designed for precision farming in the Souss-Massa region (Agadir, Morocco). This full-stack IoT dashboard combines real-time environmental monitoring with AI-powered agricultural insights to help farmers make data-driven decisions.

### 🎯 Core Mission
Transform raw sensor data into actionable agricultural intelligence through an elegant, user-friendly interface with professional dark mode design and smooth animations.

---

## 🎨 Design Highlights - NEW PROFESSIONAL UI

### ✨ Visual Features

- **🌙 Professional Dark Mode** - Eye-friendly dark theme with emerald green accents
- **💎 Glassmorphism Effects** - Modern frosted glass cards with backdrop blur
- **🎭 Framer Motion Animations** - Smooth, purposeful animations that enhance UX
- **🎯 Smart Visual Feedback** - Color-coded status system:
  - 🔴 **Red Glow**: Temperature > 30°C (Danger alert)
  - 🔵 **Blue Glow**: Temperature < 10°C (Cold warning)
  - 🟢 **Green Glow**: Optimal conditions (Success)
- **📱 Fully Responsive** - Beautiful on mobile, tablet, and desktop
- **⚡ Real-time Updates** - Auto-refresh every 30 seconds
- **🎪 Interactive Elements** - Hover effects, mobile sidebar, refresh button

---

## 🏗️ Technical Architecture

### Backend (Python/Flask)
- **Role**: RESTful API & Business Logic Layer
- **Framework**: Flask 3.0+ with CORS enabled
- **Data Source**: Open-Meteo Weather API (Agadir coordinates)
- **AI Logic**: Rule-based inference engine for agricultural advice
- **Port**: `5000`

### Frontend (React/Vite)
- **Framework**: React 19+ (Functional Components & Hooks)
- **Build Tool**: Vite 6+ (Lightning-fast HMR)
- **Styling**: Tailwind CSS 4+ (Utility-first CSS)
- **Animations**: Framer Motion 12+ (Production-grade animations)
- **Icons**: Lucide React 0.488+ (Beautiful, consistent icons)
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Port**: `5173` or `5174`

---

## 🚀 Quick Start Guide

### Prerequisites

```bash
# Required Software
- Python 3.10+
- Node.js 18+
- npm or yarn
```

### 1️⃣ Launch Backend (Flask Server)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

**✅ Backend running at:** `http://localhost:5000`

### 2️⃣ Launch Frontend (React App)

```bash
# Open new terminal
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**✅ Frontend running at:** `http://localhost:5173`

### 3️⃣ Open in Browser

Navigate to: **http://localhost:5173**

---

## 📡 API Reference

### Endpoint: `GET /api/sensor`

**Description**: Returns current weather telemetry with AI-generated agricultural advice.

**Response Schema:**
```json
{
  "location": "Agadir, Morocco",
  "temperature": 32.5,
  "windspeed": 12.0,
  "status": "danger",
  "advice": "⚠️ Alert: High temperature detected! Irrigation recommended immediately."
}
```

**Status Values:**
- `"success"` - ✅ Optimal agricultural conditions (Green UI theme)
- `"warning"` - ⚡ Elevated conditions, monitoring advised (Amber UI theme)
- `"danger"` - 🚨 Extreme conditions, immediate action required (Red UI theme)

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Real-time Monitoring** | Live temperature and wind speed data for Agadir region |
| **AI Agricultural Advisor** | Context-aware recommendations (irrigation, frost protection, etc.) |
| **Dynamic Glow Effects** | Temperature cards glow red/blue/green based on readings |
| **Auto-Refresh** | Data updates automatically every 30 seconds |
| **Status Indicators** | Pulsing live status dot with color-coded badges |
| **Progress Bars** | Animated visual representation of sensor values |
| **Mobile Sidebar** | Slide-in menu with spring physics animation |
| **Error Handling** | Graceful error states with retry functionality |
| **Loading States** | Professional spinner with smooth fade-in |
| **Responsive Design** | Optimized layouts for all screen sizes |

---

## 🎨 Design System

### Color Palette

```css
/* Primary Brand Colors */
Emerald-500: #10b981  /* Growth, Nature, Agriculture */
Teal-400: #2dd4bf     /* Water, Fresh, Complementary */

/* Dark Background Layers */
Slate-950: #020617    /* Deepest background */
Slate-900: #0f172a    /* Secondary background */
Slate-800: #1e293b    /* Card backgrounds */

/* Semantic Status Colors */
Success: #10b981      /* Optimal conditions */
Warning: #f59e0b      /* Caution, monitor closely */
Danger: #ef4444       /* Alerts, immediate action */
Info: #22d3ee         /* Wind, water-related data */
```

### Typography

- **Font Family**: Plus Jakarta Sans (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Display**: 48px - Sensor readings
- **Headings**: 20-24px - Section titles
- **Body**: 16px - Main content
- **Labels**: 14px - Metadata

---

## 📁 Project Structure

```
test-project-iot-watch/
├── backend/
│   ├── app.py                  # Flask application (API routes)
│   ├── requirements.txt        # Python dependencies
│   ├── services/
│   │   └── weather_fetcher.py  # Weather API integration
│   └── database/
│       └── temperature.db      # SQLite database
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component (425 lines)
│   │   ├── index.css          # Global styles + Tailwind utilities
│   │   ├── App.css            # Component-specific styles
│   │   └── main.jsx           # React entry point
│   ├── public/
│   │   └── favicon.svg
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind customization
│   ├── vite.config.js         # Vite build configuration
│   └── postcss.config.js      # PostCSS configuration
├── README.md                  # This file
├── SETUP-GUIDE.md             # Detailed setup instructions
└── DESIGN-PROMPT.md           # Complete design specifications
```

---

## 🔧 Production Build

### Frontend Production Build

```bash
cd frontend
npm run build

# Output: dist/ folder with optimized static files
```

### Backend Production Deployment

```bash
# Install production WSGI server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🐛 Troubleshooting

### Backend Issues

```bash
# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### Frontend Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

### CORS Errors

Ensure Backend is running on `http://localhost:5000` and CORS is enabled in `app.py`:

```python
from flask_cors import CORS
CORS(app)
```

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
Flask==3.0.0
flask-cors==4.0.0
requests==2.31.0
```

### Frontend (`package.json`)
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "framer-motion": "^12.29.2",
  "lucide-react": "^0.488.0",
  "tailwindcss": "^4.1.4"
}
```

---

## 🌟 Implemented Features Checklist

- ✅ Professional Dark Mode UI
- ✅ Glassmorphism card effects
- ✅ Framer Motion animations (stagger, spring, fade)
- ✅ Dynamic glow effects based on temperature
- ✅ Color-coded status system (success/warning/danger)
- ✅ Real-time auto-refresh (30s interval)
- ✅ Mobile-responsive design (mobile-first)
- ✅ Animated progress bars
- ✅ Loading spinner with fade-in
- ✅ Error handling with retry button
- ✅ Mobile sidebar with spring animation
- ✅ Live status indicator (pulsing dot)
- ✅ Hover effects on cards
- ✅ Custom Google Font integration
- ✅ SVG background pattern
- ✅ Gradient text effects
- ✅ Custom scrollbar styling

---

## 🚀 Future Enhancements (Roadmap)

### Phase 2 - Data Visualization
- [ ] Historical data charts (line/bar graphs)
- [ ] 7-day temperature trends
- [ ] Weekly weather forecasts
- [ ] Data export (CSV/PDF)

### Phase 3 - Advanced Features
- [ ] Multiple farm locations
- [ ] User authentication & profiles
- [ ] Push notifications for alerts
- [ ] Soil moisture integration
- [ ] Crop health monitoring
- [ ] Machine learning predictions
- [ ] Light/Dark theme toggle
- [ ] Multi-language support (Arabic/English/French)

---

## 👨‍💻 Developer

**Anouar Ech-charai**  
Full Stack Developer (Java/Angular → Python/React)  
Specializing in Agricultural IoT & Smart Systems

---

## 🙏 Acknowledgments

- **Open-Meteo API** - Free weather data provider
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **Lucide Icons** - Beautiful, consistent icon set
- **Vite** - Next-generation frontend tooling

---

## 📄 License

This project is for educational purposes and demonstration of Full Stack development skills.

---

## 📞 Support

For detailed setup instructions, see [`SETUP-GUIDE.md`](./SETUP-GUIDE.md).  
For complete design specifications, see [`DESIGN-PROMPT.md`](./DESIGN-PROMPT.md).

---

**🌟 AGRI 4.0 - Where Technology Meets Agriculture**

**Made with ❤️ for Smart Farming**(Advice).

### ⚛️ Frontend (React/Vite)
- **Role:** Client-side Visualization.
- **Key Features:**
  - **State Management:** Utilizes React Hooks (`useState`, `useEffect`) for efficient data handling.
  - **Dynamic Rendering:** Real-time UI updates based on API response payloads.
  - **Responsive Design:** Optimized for desktop and mobile monitoring.

---

## ✨ Functional Features

| Feature | Description |
| :--- | :--- |
| **Real-time Telemetry** | Live monitoring of temperature and wind speed specifically for Agadir coordinates. |
| **Smart Alerts** | Automated analysis of conditions (e.g., *Heatwave detection* > 30°C triggers an irrigation warning). |
| **Visual Indicators** | Color-coded status system (Green/Orange/Red) for immediate risk assessment. |
| **Fault Tolerance** | Error handling mechanisms for API timeouts or data unavailability. |

---

## 🚀 Installation & Setup Guide

Follow these steps to deploy the application locally.

### Prerequisites
- Python 3.10+
- Node.js & npm

### 1. Backend Service (Flask)
The backend handles API requests and logic processing on port `5000`.

```bash
cd backend

# Create virtual environment
python -m venv iot-env

# Activate environment
# Windows:
iot-env\Scripts\activate
# Mac/Linux:
source iot-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch API Server
python app.py


# ================================================================================================================================


2. Frontend Application (React)
The frontend serves the user interface on port 5173.

Bash

cd frontend/ReactApp

# Install dependencies
npm install

# Start Development Server
npm run dev
Note: Once both servers are running, open your browser and navigate to the local URL provided by Vite (usually http://localhost:5173).

📡 API Reference
Endpoint: GET /api/sensor

Description: Returns the current weather telemetry along with AI-generated advice.

Response Payload Example:

JSON

{
  "location": "Agadir, Morocco",
  "temperature": 32.5,
  "windspeed": 12.0,
  "status": "danger",
  "advice": "⚠️ Alert: High temperature detected! Irrigation recommended immediately."
}
👨 Author
Anouar Ech-charai Full Stack Developer (Java/Angular specialist adapting to Python/React ecosystem)