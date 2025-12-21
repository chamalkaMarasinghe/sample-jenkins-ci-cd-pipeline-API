pipeline {
  agent any
  options {
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'REMOTE_HOST', defaultValue: '20.106.51.21', description: 'Remote Azure VM IP')
    string(name: 'REMOTE_USER', defaultValue: 'icieos', description: 'Remote SSH Username')
    string(name: 'APP_DIR', defaultValue: '/home/icieos/supreme-edits-api', description: 'App Directory on Remote VM')
    string(name: 'REPO_URL', defaultValue: 'git@github.com:icieos-enterprise-org/supreme-edits-api.git', description: 'Git Repository URL')
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git Branch to deploy')
    string(name: 'DOPPLER_PROJECT', defaultValue: 'supreme-edits-api', description: 'Doppler Project Name')
    string(name: 'DOPPLER_CONFIG', defaultValue: 'prd', description: 'Doppler Config (env)')
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
                doppler secrets download --project ${params.DOPPLER_PROJECT} --config ${params.DOPPLER_CONFIG} --format env --no-file > .env
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
              docker-compose down --remove-orphans
              docker-compose build --memory=4g || docker compose build --memory=4g
              docker-compose up -d || docker compose up -d
              echo "🚀 Application deployed successfully"
              
              # Cleanup unused Docker resources
              echo "Cleaning up unused Docker resources..."
              docker system prune -a --volumes -f
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
