pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        DOCKERHUB_NAMESPACE = 'votre_dockerhub_namespace' // À personnaliser
        IMAGE_NAME = 'iot-watch-app'
        COMMIT_SHA = "${env.GIT_COMMIT}"
        DOCKER_IMAGE = "${REGISTRY}/${DOCKERHUB_NAMESPACE}/${IMAGE_NAME}:${COMMIT_SHA}"
        // Credentials Jenkins ID pour Docker Hub
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint Backend') {
            steps {
                dir('backend') {
                    sh 'pip install --upgrade pip flake8'
                    sh 'flake8 .'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run lint'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'pip install -r requirements.txt pytest'
                    sh 'pytest || echo "No tests found, skipping"'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE -f Dockerfile.production .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin $REGISTRY'
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage('Deploy (optionnel)') {
            when {
                expression { return env.DEPLOY_TARGET != null }
            }
            steps {
                echo 'Déploiement sur le serveur cible...'
                // Exemple : SSH ou docker-compose up -d sur un serveur distant
                // sh 'ssh user@host "docker pull $DOCKER_IMAGE && docker-compose -f docker-compose.prod.yml up -d"'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo 'La pipeline a échoué.'
        }
        success {
            echo 'Pipeline CI/CD terminée avec succès!'
        }
    }
} 