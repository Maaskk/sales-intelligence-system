pipeline {
    agent any
    
    tools {
        nodejs 'Node-25.8.0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'sudo apt-get update'
                sh 'sudo apt-get install -y libatomic1'
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
