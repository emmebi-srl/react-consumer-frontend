#!/usr/bin/env groovy

node('master') {
    stage 'Checkout'
        checkout scm

    stage '🚫 Remove last build directories'
        dir ('node_modules') {
            deleteDir()
        }
        dir ('build') {
            deleteDir()
        }

    stage '🇧🇿 Install packages' 
        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
            nvmIoJsOrgMirror: 'https://iojs.org/dist',
            nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
            version: '12.1.0') {
                sh 'npm install -g react-scripts'
                sh 'npm install'
            }
        
}