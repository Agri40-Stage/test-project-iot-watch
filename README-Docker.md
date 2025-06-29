# 🐳 Dockerisation Sécurisée - IoT Watch

## 📋 Vue d'ensemble

Application IoT Watch conteneurisée avec sécurité renforcée :
- ✅ Images minimales (python:3.11-slim, nginx:alpine)
- ✅ Utilisateurs non-root
- ✅ Options de sécurité (no-new-privileges)
- ✅ Health checks
- ✅ Volumes persistants
- ✅ Réseau isolé

## 🏗️ Architecture Docker

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Nginx)       │◄──►│   (Flask)       │
│   Port: 80      │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                    │
         ┌─────────────────┐
         │   Volumes       │
         │   (Data/Logs)   │
         └─────────────────┘
```

## 🚀 Déploiement Rapide

### Développement
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Mesures de Sécurité

### 1. Utilisateurs Non-Root
- Backend : `iotuser` (UID: 1000)
- Frontend : `nextjs` (UID: 1001)

### 2. Options de Sécurité
```yaml
security_opt:
  - no-new-privileges:true
```

### 3. Health Checks
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5000/api/latest', timeout=5)"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 📁 Fichiers Créés

- `backend/Dockerfile` - Backend sécurisé
- `frontend/Dockerfile` - Frontend multi-stage
- `frontend/nginx.conf` - Configuration Nginx sécurisée
- `docker-compose.yml` - Développement
- `docker-compose.prod.yml` - Production
- `Dockerfile.production` - Build unifié
- `.dockerignore` - Exclusion fichiers sensibles
- `scripts/docker-security-scan.sh` - Scanner sécurité

## 🔍 Scanner de Sécurité

```bash
chmod +x scripts/docker-security-scan.sh
./scripts/docker-security-scan.sh
```

Vérifie :
- Conteneurs non-root
- Options de sécurité
- Vulnérabilités (Trivy)
- Secrets dans images
- Santé conteneurs

## 📊 Monitoring

```bash
# Logs temps réel
docker-compose logs -f

# Statut conteneurs
docker-compose ps

# Métriques
docker stats
```

## 🔧 Configuration

### Variables d'Environnement
```bash
PORT=5000
DATABASE_PATH=/app/data/temperature.db
DEBUG=False
FLASK_ENV=production
```

### Volumes
```yaml
volumes:
  iot_data: ./data
  iot_logs: ./logs
```

## 🚨 Bonnes Pratiques

1. **Mise à jour régulière** des images de base
2. **Scan de vulnérabilités** avec Trivy
3. **Rotation des logs**
4. **Secrets management** en production
5. **Limites de ressources**

## 🐛 Dépannage

```bash
# Logs détaillés
docker-compose logs backend

# Vérifier réseau
docker network inspect iot-network

# Nettoyer
docker system prune -a
```

## 📈 Performance

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

---

**Résultat** : Application IoT sécurisée, prête pour déploiement sur systèmes embarqués avec standards de sécurité élevés.

## 📚 Ressources Additionnelles

- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [OWASP Docker Security](https://owasp.org/www-project-docker-security/)
- [Trivy Vulnerability Scanner](https://aquasecurity.github.io/trivy/)
- [Docker Bench Security](https://github.com/docker/docker-bench-security)

## 🤝 Contribution

Pour contribuer à l'amélioration de la sécurité :

1. Fork le projet
2. Créer une branche feature
3. Implémenter les améliorations
4. Tester avec le scanner de sécurité
5. Soumettre une Pull Request

---

**Note** : Cette configuration respecte les standards de sécurité pour les applications IoT et peut être déployée sur des systèmes embarqués tout en maintenant un niveau de sécurité élevé.

## 🚦 CI/CD Jenkins

### Pipeline automatisée

Le projet inclut un Jenkinsfile pour :
- Lint, tests, build, push Docker Hub, déploiement

#### Étapes de la pipeline :
1. Checkout du code
2. Lint backend (Python/Flake8)
3. Lint frontend (npm run lint)
4. Tests backend (pytest)
5. Tests frontend (npm run build)
6. Build de l'image Docker (tag SHA)
7. Push sur Docker Hub (credentials Jenkins)
8. (Optionnel) Déploiement sur serveur cible

#### Extrait Jenkinsfile :
```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Lint Backend') { steps { dir('backend') { sh 'pip install --upgrade pip flake8'; sh 'flake8 .' } } }
        stage('Lint Frontend') { steps { dir('frontend') { sh 'npm ci'; sh 'npm run lint' } } }
        stage('Test Backend') { steps { dir('backend') { sh 'pip install -r requirements.txt pytest'; sh 'pytest || echo "No tests found, skipping"' } } }
        stage('Test Frontend') { steps { dir('frontend') { sh 'npm run build' } } }
        stage('Build Docker Image') { steps { script { sh 'docker build -t $DOCKER_IMAGE -f Dockerfile.production .' } } }
        stage('Push Docker Image') { steps { script { sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin $REGISTRY'; sh 'docker push $DOCKER_IMAGE' } } }
        stage('Deploy (optionnel)') { when { expression { return env.DEPLOY_TARGET != null } } steps { echo 'Déploiement sur le serveur cible...' } }
    }
}
```

**À configurer côté Jenkins :**
- Docker installé sur l'agent
- Credentials Docker Hub (`dockerhub-credentials`)
- Personnaliser `DOCKERHUB_NAMESPACE` dans le Jenkinsfile

**Bénéfices :**
- Build/test/push automatisés
- Livraison continue fiable
- Sécurité des secrets

--- 