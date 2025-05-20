### Backend
- Python Flask
- SQLite3 pour le stockage des données
- IA : Modèle LSTM bidirectionnel avec TensorFlow/Keras pour la prédiction des températures futures

## Project Structure
```
iot-temp-watch/
├── .githup/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   ├── database/
│   ├── model/
│   │   └── m.keras
│   └── services/
│       └── weather_fetcher.py
├── data/
│   └── latest.js
│   └── history.js
├── frontend/
│   └── ReactApp/
│       ├── src/
│       ├── public/
│       ├── dist/
│       └── package.json
│
├── README.md
└── config.json
```

## Configuration manuelle

1. Créer un environnement virtuel Python :
   ```bash
   python -m venv venv
   ```

2. Activer l'environnement virtuel :
   - Windows :
     ```bash
     venv\Scripts\activate
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

## Projet origine
- https://github.com/agri40/test-project-iot-watch.git
