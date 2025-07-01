# 🌡️ IoT Temp Watch

A full-stack mini project that retrieves real-time temperature data from a public sensor API and displays it on a modern dashboard.

> ⏱ Designed as a 2-day technical challenge for junior or technician-level developers.

## Table of Contents

- [Project Goal](#project-goal)
- [Project Structure](#project-structure)
- [TODO – Practical Tasks](#todo--practical-tasks)
- [Stack Suggestions](#️-stack-suggestions)
- [Data Source](#-data-source)
- [What You'll Be Assessed On](#-what-youll-be-assessed-on)
- [Evaluation Criteria](#evaluation-criteria)
- [Configuration](#configuration-manuelle)
  - [Backend Setup](#configuration-manuelle)
  - [Frontend Setup](#configuration-du-frontend)
- [API Endpoints](#points-de-terminaison-de-lapi)

---

## Project Goal

Build a small IoT-enabled web app that:

- Retrieves temperature or humidity data from a public sensor API
- Stores and exposes the data via a backend service
- Displays the data in real time or at regular intervals via a frontend interface
- integrate AI features (LLM, RAG, Model deep learning, ...)
- IoT
- Secuirity
- ...

## Project Structure

```
test-project-iot-watch/
├── 📁 backend/                    # Python Flask API server
│   ├── app.py                     # Main Flask application
│   ├── models.py                  # Database models and data handling
│   ├── nn.py                      # Neural network for predictions
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Docker configuration for backend
│   ├── 📁 database/               # SQLite database storage
│   │   └── temperature.db         # Temperature data database
│   ├── 📁 model/                  # Machine learning models
│   │   ├── agadir_weather.csv     # Training data
│   │   ├── ml.keras               # Trained Keras model
│   │   └── temp_pred.ipynb        # Jupyter notebook for ML
│   └── 📁 services/               # External API services
│       └── weather_fetcher.py     # Weather data fetching service
├── 📁 frontend/                   # React.js dashboard
│   ├── index.html                 # Main HTML entry point
│   ├── package.json               # Node.js dependencies
│   ├── vite.config.js             # Vite build configuration
│   ├── Dockerfile                 # Docker configuration for frontend
│   ├── 📁 src/                    # Source code
│   │   ├── App.jsx                # Main React component
│   │   ├── config.js              # Configuration settings
│   │   ├── 📁 components/         # React components
│   │   │   ├── Content.jsx        # Main dashboard content
│   │   │   ├── Header.jsx         # Navigation header
│   │   │   ├── TemperatureCard.jsx    # Current temperature display
│   │   │   ├── TemperatureChart.jsx   # Temperature history chart
│   │   │   ├── TemperaturePrediction.jsx # AI prediction component
│   │   │   ├── HumidityChart.jsx      # Humidity visualization
│   │   │   └── WeeklyStats.jsx        # Weekly statistics
│   │   ├── 📁 api/                # API integration
│   │   │   ├── history.js         # Historical data fetching
│   │   │   └── latest.js          # Real-time data fetching
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── Home.jsx           # Home dashboard
│   │   │   ├── Temperature.jsx    # Temperature page
│   │   │   └── Humidity.jsx       # Humidity page
│   │   └── 📁 data/               # Data utilities
│   │       └── data.js            # Data processing utilities
├── 📁 data/                       # Static data files
│   ├── history.js                 # Historical data
│   └── latest.js                  # Latest readings
├── 📁 iot-env/                    # Python virtual environment
├── config.json                    # Project configuration
└── README.md                      # Project documentation
```

### Key Components

- **Backend**: Flask-based REST API with SQLite database
- **Frontend**: React.js SPA with Chart.js for data visualization
- **ML Integration**: Keras neural network for temperature prediction
- **Data Source**: Open-Meteo API for real weather data
- **Database**: SQLite for storing historical temperature data
- **Containerization**: Docker support for both frontend and backend

## TODO – Practical Tasks

This challenge also assesses your hands-on engineering skills through the following tasks:

- Analyze existing code to understand its structure and logic
- Review a pull request, leaving at least one meaningful comment in English
- Submit a small technical implementation via a pull request (PR)
- Create a clear and relevant GitHub Issue, describing a problem or suggesting an improvement

---

## ⚙️ Stack Suggestions

### Backend

Python (Flask)
SQLite3 pour la persistance

### Frontend

- React (preferred).

### Optional

- WebSocket for real-time updates
- SQLite for persistence
- Docker/Docker Compose
- GitHub Actions CI
- How to Contribute : https://www.youtube.com/embed/yzeVMecydCE

---

## 🌐 Data Source

Use one of the following free/public sensor APIs:

- [Open-Meteo API](https://open-meteo.com/en/docs)
- [ThingSpeak](https://thingspeak.com/)
- Any dummy IoT API or mock sensor server

---

## ✅ What You’ll Be Assessed On

| Category          | Details                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Figma design      | propose or improve a design figma                                    |
| 🏗 Project Setup   | Proper use of JHipster to scaffold and configure the app             |
| 🔒 Authentication | Secure login system using JWT and protected API routes               |
| 💻 Frontend       | Functional React UI to manage employees with proper state handling   |
| 📦 API Usage      | Clean and secure usage of RESTful APIs                               |
| 🧼 Code Quality   | Maintainable, modular, and readable code                             |
| 🔁 Git Practices  | Use of Git flow, meaningful commit messages, and clean pull requests |

## Evaluation Criteria

| Area                  | Importance |
| --------------------- | ---------- |
| Git usage             | ★★★★☆      |
| Backend functionality | ★★★★☆      |
| Frontend UX           | ★★★★☆      |
| Code quality          | ★★★★☆      |
| Documentation         | ★★★★☆      |
| Bonus features        | ★★☆☆☆      |
| IoT                   | ★★★★☆      |

## Configuration manuelle

1. Télécharger Python 3.10 depuis le site officiel :
   https://www.python.org/downloads/release/python-3109/

Créer un environnement virtuel Python :

```bash
python3.10 -m venv iot-env
```

Activer l'environnement virtuel :

- Windows :
  ```bash
  iot-env\Scripts\activate
  ```

2. ou bien Utiliser conda pour créer un environnement compatible :
   Windows PowerShell

```bash
 wget "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -outfile ".\miniconda.exe"
 Start-Process -FilePath ".\miniconda.exe" -ArgumentList "/S" -Wait
 del .\miniconda.exe
```

```bash
conda create -n iot-env python=3.10
conda activate iot-env
```

3. Installer les dépendances Python :

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Créer un fichier `.env` avec le contenu suivant :

   ```
   PORT=5000
   DATABASE_PATH=temperature.db
   DEBUG=True
   ```

5. Lancer l'application Flask :
   ```bash
   cd backend
   python app.py
   ```

### Configuration du Frontend

1. Depuis le répertoire frontend, installer les dépendances :

   ```bash
   cd ReactApp
   npm install
   ```

2. Créer un fichier `.env.local` avec le contenu suivant :

   ```
   VITE_API_URL=https://api.open-meteo.com/v1/forecast
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. Lancer le serveur de développement :
   ```bash
   cd frontend/ReactApp
   npm run dev
   ```

## Points de terminaison de l'API

Le backend fournit les points de terminaison suivants :

- `/data/latest` – Obtenir la dernière température avec tendance
- `/data/history` – Obtenir l'historique des températures des dernières heures
