#!/usr/bin/env groovy

pipeline {
    agent any

    stages {
        stage('Checkout'){
            steps {
                checkout scm
            }
        }

        stage('🚫 Remove last build directories'){
            steps {
                dir ('node_modules') {
                    deleteDir()
                }
                dir ('build') {
                    deleteDir()
                }
            }
        }

        stage('🇧🇿 Install packages'){
            steps {
                nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
                    nvmIoJsOrgMirror: 'https://iojs.org/dist',
                    nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
                    version: '12.1.0') {
                        sh 'npm install -g react-scripts'
                        sh 'npm install'
                    }
            }
        }
            
        stage('🚧 Build app') {
            steps {
                nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
                    nvmIoJsOrgMirror: 'https://iojs.org/dist',
                    nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
                    version: '12.1.0') {
                        sh 'npm run build:prod'
                    }
            }
        }

        stage('🚀 SSH transfer') {
            steps {
                sshPublisher(
                    continueOnError: false, failOnError: true,
                    publishers: [
                        sshPublisherDesc(
                        configName: "aries-web-app",
                        verbose: true,
                        transfers: [
                        sshTransfer(
                            sourceFiles: "build/**/*.*",
                            removePrefix: "build",
                            remoteDirectory: "/var/www/html",
                            )
                        ])
                ])
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'build/**/*.*', onlyIfSuccessful: true
        }
    }  

}