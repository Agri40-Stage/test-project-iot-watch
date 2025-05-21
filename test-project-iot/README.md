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
└── README.md
```

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

## Projet origine
- https://github.com/agri40/test-project-iot-watch.git
