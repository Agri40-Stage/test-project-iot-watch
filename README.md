# 🌡️ IoT Temp Watch

A full-stack mini project that retrieves real-time temperature data from a public sensor API and displays it on a modern dashboard with **secure Docker containerization**.

> ⏱ Designed as a 2-day technical challenge for junior or technician-level developers.

---

## 🎯 Project Goal

Build a small IoT-enabled web app that:
- ✅ Retrieves temperature or humidity data from a public sensor API
- ✅ Stores and exposes the data via a backend service
- ✅ Displays the data in real time or at regular intervals via a frontend interface
- ✅ **🐳 Secure Docker containerization with best practices**
- ✅ **🔒 Security-first approach with non-root users**
- ✅ **📊 Real-time monitoring and health checks**
- 🔄 Integrate AI features (LLM, RAG, Model deep learning, ...)
- 🔄 Advanced IoT features
- 🔄 Enhanced security measures

## 🚀 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Git

### One-Command Deployment
```bash
# Clone the repository
git clone <your-repo-url>
cd test-project-iot-watch-DevSecOps-improvements

# Start the application (Development)
docker-compose up -d

# Or start with production settings
docker-compose -f docker-compose.prod.yml up -d
```

### Access the Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost/health

### Security Scan
```bash
# Run security scanner
chmod +x scripts/docker-security-scan.sh
./scripts/docker-security-scan.sh
```

---

## 🔒 Security Features

### Docker Security Best Practices
- ✅ **Non-root users** in all containers
- ✅ **Minimal base images** (python:3.11-slim, nginx:alpine)
- ✅ **Security options** (no-new-privileges)
- ✅ **Health checks** for monitoring
- ✅ **Read-only filesystems** where possible
- ✅ **Resource limits** to prevent abuse
- ✅ **Network isolation** between services

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy
- Referrer-Policy: strict-origin-when-cross-origin

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Nginx)       │◄──►│   (Flask)       │
│   Port: 80      │    │   Port: 5000    │
│   React App     │    │   Python API    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                    │
         ┌─────────────────┐
         │   Volumes       │
         │   (Data/Logs)   │
         └─────────────────┘
```

---

## ⚙️ Technology Stack

### Backend
- **Python 3.11** with Flask
- **SQLite3** for data persistence
- **TensorFlow/Scikit-learn** for AI predictions
- **Schedule** for background tasks

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **React Router** for navigation

### DevOps & Security
- **Docker & Docker Compose** for containerization
- **Nginx** as reverse proxy
- **Health checks** for monitoring
- **Security scanning** with custom scripts

---

## 📁 Project Structure

```
├── backend/
│   ├── Dockerfile              # Secure backend container
│   ├── app.py                  # Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── models.py              # AI/ML models
│   └── services/              # Business logic
├── frontend/
│   ├── Dockerfile              # Multi-stage frontend build
│   ├── nginx.conf              # Secure Nginx configuration
│   ├── package.json           # Node.js dependencies
│   └── src/                   # React components
├── docker-compose.yml          # Development orchestration
├── docker-compose.prod.yml     # Production orchestration
├── Dockerfile.production       # Unified production build
├── .dockerignore               # Security exclusions
├── scripts/
│   └── docker-security-scan.sh # Security scanner
└── README-Docker.md            # Docker documentation
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
PORT=5000
DATABASE_PATH=/app/data/temperature.db
DEBUG=False
FLASK_ENV=production
FLASK_SECRET_KEY=your-secret-key-change-in-production
```

#### Frontend (.env.local)
```bash
VITE_API_URL=https://api.open-meteo.com/v1/forecast
VITE_API_BASE_URL=http://localhost:5000
```

### Volumes
- `iot_data`: Persistent temperature data
- `iot_logs`: Application logs

---

## 📊 API Endpoints

### Core Endpoints
- `GET /api/latest` – Latest temperature with trend analysis
- `GET /api/history` – Historical temperature data
- `GET /api/weekly-stats` – Weekly statistics
- `GET /api/predict` – AI-powered temperature predictions
- `GET /api/forecast` – 5-day hourly forecast

### Health & Monitoring
- `GET /health` – Application health check
- `GET /api/latest` – Backend health check

---

## 🚨 Security Best Practices

### 1. Regular Updates
```bash
# Update base images
docker-compose pull
docker-compose build --no-cache
```

### 2. Vulnerability Scanning
```bash
# Install Trivy (recommended)
# https://aquasecurity.github.io/trivy/latest/getting-started/installation/

# Scan images
trivy image iot-watch-backend:latest
trivy image iot-watch-frontend:latest
```

### 3. Secrets Management
```bash
# Use Docker Secrets in production
echo "your-secret-key" | docker secret create flask_secret_key -
```

### 4. Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

---

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check permissions
ls -la data/ logs/
```

#### Network Issues
```bash
# Inspect network
docker network inspect iot-network

# Check container connectivity
docker exec iot-backend ping frontend
```

#### Performance Issues
```bash
# Monitor resources
docker stats

# Check health status
docker-compose ps
```

### Useful Commands
```bash
# View logs in real-time
docker-compose logs -f

# Restart services
docker-compose restart

# Clean up
docker system prune -a
```

---

## 📈 Performance & Monitoring

### Health Checks
- **Backend**: API endpoint availability
- **Frontend**: Nginx service status
- **Database**: SQLite file integrity

### Resource Monitoring
- CPU and memory limits
- Disk usage for volumes
- Network connectivity

### Logging
- Structured logging for backend
- Nginx access/error logs
- Docker container logs

---

## 🔄 Development Workflow

### Local Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml ps
```

### Testing
```bash
# Run security scan
./scripts/docker-security-scan.sh

# Test API endpoints
curl http://localhost:5000/api/latest
curl http://localhost/health
```

---

## 📚 Documentation

- **[README-Docker.md](README-Docker.md)** - Detailed Docker documentation
- **[Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)**
- **[OWASP Docker Security](https://owasp.org/www-project-docker-security/)**

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality
- Follow security best practices
- Add tests for new features
- Update documentation
- Run security scan before PR

---

## 📋 TODO – Practical Tasks

This challenge assesses your hands-on engineering skills through:

- ✅ **Analyze existing code** to understand structure and logic
- ✅ **Review pull requests** with meaningful comments
- ✅ **Submit technical implementations** via pull requests
- ✅ **Create GitHub Issues** for improvements
- ✅ **🐳 Implement secure Docker containerization**

---

## ✅ Evaluation Criteria

| Area              | Importance | Status |
|-------------------|------------|--------|
| Git usage         | ★★★★☆     | ✅     |
| Backend functionality | ★★★★☆ | ✅     |
| Frontend UX       | ★★★★☆     | ✅     |
| Code quality      | ★★★★☆     | ✅     |
| Documentation     | ★★★★☆     | ✅     |
| **🐳 Docker Security** | **★★★★★** | **✅** |
| IoT               | ★★★★☆     | ✅     |
| Bonus features    | ★★☆☆☆     | 🔄     |

---

## 🎉 Success Metrics

- ✅ **Secure containerization** with non-root users
- ✅ **Production-ready** Docker configuration
- ✅ **Health monitoring** and automated checks
- ✅ **Security scanning** capabilities
- ✅ **Easy deployment** on any system
- ✅ **Comprehensive documentation**

---

**🎯 Result**: A production-ready IoT application with enterprise-grade security, ready for deployment on embedded systems with high security standards.
