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
