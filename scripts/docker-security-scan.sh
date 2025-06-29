#!/bin/bash

# Docker Security Scanner for IoT Watch Application
# This script performs security checks on Docker images

set -e

echo "🔒 Docker Security Scanner for IoT Watch"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Check Docker installation
if ! command_exists docker; then
    print_status "ERROR" "Docker is not installed"
    exit 1
fi

print_status "SUCCESS" "Docker is installed"

# Check Docker Compose
if ! command_exists docker-compose; then
    print_status "WARNING" "Docker Compose is not installed"
else
    print_status "SUCCESS" "Docker Compose is installed"
fi

# Build images
echo ""
echo "🏗️  Building Docker images..."
docker-compose build

# Security checks
echo ""
echo "🔍 Performing security checks..."

# Check for running containers as root
echo "Checking for containers running as root..."
ROOT_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -v "NAMES" | awk '{print $1}' | xargs -I {} docker exec {} whoami 2>/dev/null | grep -c "root" || echo "0")

if [ "$ROOT_CONTAINERS" -gt 0 ]; then
    print_status "WARNING" "Found containers running as root"
else
    print_status "SUCCESS" "No containers running as root"
fi

# Check for privileged containers
echo "Checking for privileged containers..."
PRIVILEGED_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -c "privileged" || echo "0")

if [ "$PRIVILEGED_CONTAINERS" -gt 0 ]; then
    print_status "WARNING" "Found privileged containers"
else
    print_status "SUCCESS" "No privileged containers found"
fi

# Check for exposed ports
echo "Checking exposed ports..."
EXPOSED_PORTS=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -o ":[0-9]*->" | wc -l)

if [ "$EXPOSED_PORTS" -gt 0 ]; then
    print_status "SUCCESS" "Found $EXPOSED_PORTS exposed ports"
else
    print_status "WARNING" "No exposed ports found"
fi

# Check for security options
echo "Checking security options..."
SECURITY_OPTS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -c "no-new-privileges" || echo "0")

if [ "$SECURITY_OPTS" -gt 0 ]; then
    print_status "SUCCESS" "Security options are configured"
else
    print_status "WARNING" "No security options found"
fi

# Check image vulnerabilities (if trivy is available)
if command_exists trivy; then
    echo ""
    echo "🔍 Scanning for vulnerabilities with Trivy..."
    
    # Scan backend image
    echo "Scanning backend image..."
    trivy image iot-watch-backend:latest || print_status "WARNING" "Trivy scan failed for backend"
    
    # Scan frontend image
    echo "Scanning frontend image..."
    trivy image iot-watch-frontend:latest || print_status "WARNING" "Trivy scan failed for frontend"
else
    print_status "WARNING" "Trivy not installed - skipping vulnerability scan"
    echo "Install Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
fi

# Check for secrets in images
echo ""
echo "🔍 Checking for secrets in images..."
SECRETS_FOUND=$(docker history iot-watch-backend:latest | grep -i "secret\|password\|key\|token" | wc -l || echo "0")

if [ "$SECRETS_FOUND" -gt 0 ]; then
    print_status "WARNING" "Potential secrets found in image history"
else
    print_status "SUCCESS" "No obvious secrets found in image history"
fi

# Check container health
echo ""
echo "🏥 Checking container health..."
docker-compose up -d
sleep 10

HEALTH_STATUS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -c "healthy" || echo "0")
TOTAL_CONTAINERS=$(docker ps --format "table {{.Names}}" | grep -v "NAMES" | wc -l)

if [ "$HEALTH_STATUS" -eq "$TOTAL_CONTAINERS" ]; then
    print_status "SUCCESS" "All containers are healthy"
else
    print_status "WARNING" "Some containers are not healthy"
fi

# Final recommendations
echo ""
echo "📋 Security Recommendations:"
echo "============================"
echo "1. ✅ Use non-root users in containers"
echo "2. ✅ Implement security options (no-new-privileges)"
echo "3. ✅ Use minimal base images"
echo "4. ✅ Scan for vulnerabilities regularly"
echo "5. ✅ Keep base images updated"
echo "6. ✅ Use secrets management for sensitive data"
echo "7. ✅ Implement proper logging and monitoring"
echo "8. ✅ Use read-only filesystems where possible"

echo ""
print_status "SUCCESS" "Security scan completed"

# Cleanup
docker-compose down

echo ""
echo "🚀 To run the application:"
echo "   docker-compose up -d"
echo ""
echo "🔒 To run with production settings:"
echo "   docker-compose -f docker-compose.prod.yml up -d" 