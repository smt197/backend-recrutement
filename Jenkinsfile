pipeline {
  agent any

  environment {
    NODE_ENV = 'development'
  }

  tools {
    nodejs 'NodeJS_18' // Défini dans Jenkins > Global Tools Configuration
  }

  stages {
    stage('Checkout Code') {
      steps {
        git credentialsId: 'your-git-credentials-id', url: 'https://github.com/smt197/backend-recrutement.git', branch: 'master'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        echo 'Déploiement en production...'
        // Ajoute ici ton script de déploiement, par exemple :
        // sh './scripts/deploy.sh'
      }
    }
  }

  post {
    always {
      echo 'Pipeline terminé.'
    }
    success {
      echo 'Succès !'
    }
    failure {
      echo 'Échec du pipeline.'
    }
  }
}
// Remplace 'your-git-credentials-id' par l'ID de tes identifiants Git dans Jenkins