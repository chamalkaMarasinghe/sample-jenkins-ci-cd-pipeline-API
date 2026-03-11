pipeline {
  agent any
  options {
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'REMOTE_HOST', defaultValue: '40.81.224.228', description: 'Remote Azure VM IP - client test vm')
    string(name: 'REMOTE_USER', defaultValue: 'azurevps1', description: 'remote ssh username of client test vm')
    string(name: 'APP_DIR', defaultValue: '/home/azurevps1/event-mgt-system-api', description: 'App Directory on Remote client test VM')
    string(name: 'REPO_URL', defaultValue: 'git@github.com:chamalkaMarasinghe/event-management-system-api.git', description: 'Git Repository URL')
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git Branch to deploy')
    string(name: 'DOCKERHUB_USERNAME', defaultValue: 'chamalkamarasinghe', description: 'Docker Hub account user name')
    string(name: 'DOPPLER_PROJECT', defaultValue: 'event-mgt-api', description: 'Doppler Project Name')
    string(name: 'DOPPLER_CONFIG_GATEWAY_SERVICE', defaultValue: 'dev_api_gateway', description: 'Doppler Config (env)')
    string(name: 'DOPPLER_CONFIG_AUTH_SERVICE', defaultValue: 'dev_auth_service', description: 'Doppler Config (env)')
    string(name: 'DOPPLER_CONFIG_EVENT_SERVICE', defaultValue: 'dev_event_service', description: 'Doppler Config (env)')
    string(name: 'DOPPLER_CONFIG_NOTIFICATION_SERVICE', defaultValue: 'dev_notification_service', description: 'Doppler Config (env)')
  }

  environment {
    SSH_OPTIONS = "-o StrictHostKeyChecking=no"
  }

  stages {
    stage('Validate SSH Connection') {
      steps {
        sshagent(credentials: ['azure-ssh-key']) {
          sh "ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} 'echo ✅ SSH connection successful'"
        }
      }
    }

    stage('Clone or Pull Code on Remote VM') {
      steps {
        // ✅ This pulls code into Jenkins workspace on azurevps2 — for SonarCloud
        checkout([
          $class: 'GitSCM',
          branches: [[name: "*/${params.BRANCH}"]],
          userRemoteConfigs: [[
            url: params.REPO_URL,
            credentialsId: 'azure-ssh-key'
          ]]
        ])
        // ✅ This pulls code into azurevps1 — for Docker build & deploy
        sshagent(credentials: ['azure-ssh-key']) {
          sh """
            ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} '
              set -e
              if [ ! -d "${params.APP_DIR}/.git" ]; then
                echo "📦 Cloning repository from branch: ${params.BRANCH}"
                rm -rf ${params.APP_DIR}
                git clone --branch ${params.BRANCH} ${params.REPO_URL} ${params.APP_DIR}
              else
                echo "🔄 Pulling latest code from branch: ${params.BRANCH}"
                cd ${params.APP_DIR}
                git fetch origin
                git checkout ${params.BRANCH}
                git reset --hard origin/${params.BRANCH}
              fi
            '
          """
        }
      }
    }
    
    stage('SonarCloud - SAST Scan') {
      steps {
        withCredentials([string(credentialsId: 'sonarcloud-token', variable: 'SONAR_TOKEN')]) {
          sh """
            echo "📁 Workspace contents:"
             ls -la "\${WORKSPACE}"
            
            echo "🔎 Running SonarCloud SAST analysis..."
            sonar-scanner -Dsonar.projectKey=chamalkaMarasinghe_event-management-system-api -Dsonar.organization=chamalkamarasinghe -Dsonar.host.url=https://sonarcloud.io -Dsonar.token=\$SONAR_TOKEN -Dsonar.sources=. -Dsonar.projectBaseDir="\${WORKSPACE}" -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/.git/** -Dsonar.branch.name=${params.BRANCH}
            echo "✅ SonarCloud scan completed — check https://sonarcloud.io"
          """
        }
      }
    }

    stage('Fetch .env from Doppler') {
      steps {
        withCredentials([string(credentialsId: 'doppler-token', variable: 'DOPPLER_TOKEN')]) {
          sshagent(credentials: ['azure-ssh-key']) {
            sh """
              ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} '
                set -e
                export DOPPLER_TOKEN=${DOPPLER_TOKEN}
                echo "🔐 Fetching environment variables from Doppler..."
                cd ${params.APP_DIR}
                doppler secrets download --project ${params.DOPPLER_PROJECT} --config ${params.DOPPLER_CONFIG_GATEWAY_SERVICE} --format env --no-file > services/api-gateway/.env
                doppler secrets download --project ${params.DOPPLER_PROJECT} --config ${params.DOPPLER_CONFIG_AUTH_SERVICE} --format env --no-file > services/auth-service/.env
                doppler secrets download --project ${params.DOPPLER_PROJECT} --config ${params.DOPPLER_CONFIG_EVENT_SERVICE} --format env --no-file > services/event-service/.env
                doppler secrets download --project ${params.DOPPLER_PROJECT} --config ${params.DOPPLER_CONFIG_NOTIFICATION_SERVICE} --format env --no-file > services/notification-service/.env
                echo "✅ .env file created"
              '
            """
          }
        }
      }
    }

    stage('Docker Compose Build & Deploy') {
      steps {
        sshagent(credentials: ['azure-ssh-key']) {
          sh """
            ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} '
              set -e
              echo "🛠️ Running docker-compose with memory limit..."
              cd ${params.APP_DIR}
              export DOCKER_BUILDKIT=1
              
              echo "🔨 Building API Gateway image..."
              docker build -t ${params.DOCKERHUB_USERNAME}/event-mgt-api-gateway:latest -f services/api-gateway/Dockerfile services/api-gateway

              echo "🔨 Building Auth Service image..."
              docker build -t ${params.DOCKERHUB_USERNAME}/event-mgt-auth-service:latest -f services/auth-service/Dockerfile services/auth-service

              echo "🔨 Building Event Service image..."
              docker build -t ${params.DOCKERHUB_USERNAME}/event-mgt-event-service:latest -f services/event-service/Dockerfile services/event-service

              echo "🔨 Building Notification Service image..."
              docker build -t ${params.DOCKERHUB_USERNAME}/event-mgt-notification-service:latest -f services/notification-service/Dockerfile services/notification-service

              echo "✅ All images built successfully"
            '
          """
        }
      }
    }

    stage('Push Images to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKERHUB_USER',
          passwordVariable: 'DOCKERHUB_PASS'
        )]) {
          sshagent(credentials: ['azure-ssh-key']) {
            sh """
              ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} '
                set -e
                echo "🔐 Logging in to Docker Hub..."
                echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin

                echo "📤 Pushing API Gateway image..."
                docker push ${params.DOCKERHUB_USERNAME}/event-mgt-api-gateway:latest

                echo "📤 Pushing Auth Service image..."
                docker push ${params.DOCKERHUB_USERNAME}/event-mgt-auth-service:latest

                echo "📤 Pushing Event Service image..."
                docker push ${params.DOCKERHUB_USERNAME}/event-mgt-event-service:latest

                echo "📤 Pushing Notification Service image..."
                docker push ${params.DOCKERHUB_USERNAME}/event-mgt-notification-service:latest

                echo "🔓 Logging out from Docker Hub..."
                docker logout

                echo "✅ All images pushed to Docker Hub"
              '
            """
          }
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        sshagent(credentials: ['azure-ssh-key']) {
          sh """
            ssh ${env.SSH_OPTIONS} ${params.REMOTE_USER}@${params.REMOTE_HOST} '
              set -e
              echo "🚀 Deploying application..."
              cd ${params.APP_DIR}

              # Pull latest images from Docker Hub
              docker-compose pull || docker compose pull

              # Restart containers with new images
              docker-compose down --remove-orphans
              docker-compose up -d || docker compose up -d

              echo "✅ Application deployed successfully"

              # Cleanup unused Docker resources
              echo "🧹 Cleaning up unused Docker resources..."
              docker system prune -f
            '
          """
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}