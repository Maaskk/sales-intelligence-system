pipeline {
    agent any
    
    tools {
        nodejs 'Node-25'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install System Dependency') {
            steps {
                sh 'apt-get update'
                sh 'apt-get install -y libatomic1'
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
