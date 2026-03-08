pipeline {
    agent any
    
    tools {
        nodejs 'Node-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Build successful!'
            }
        }
    }
    
    post {
        success {
            echo 'Bravo, déploiement réussi !'
        }
        failure {
            echo 'Build failed - check logs'
        }
    }
}
