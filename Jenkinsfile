pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -'
                sh 'sudo apt-get update'
                sh 'sudo apt-get install -y nodejs'
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
    }
}
