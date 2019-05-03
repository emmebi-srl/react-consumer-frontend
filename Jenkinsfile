#!/usr/bin/env groovy

node('master') {
    stage 'Checkout'
        checkout scm

    stage '🇧🇿 Install packages' 
        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
            nvmIoJsOrgMirror: 'https://iojs.org/dist',
            nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
            version: '8.1.2') {
                sh "npm install"
                echo "Build main site distribution"
                sh "npm run build:dist"
            }
        
}