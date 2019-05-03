#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Nvm installation'
        sh 'nvm current || echo "SSH NVM is being installed" &&  touch ~/.profile && curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh && bash install_nvm.sh && source ~/.profile'

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'
        sh 'echo $NVM_DIR'

    stage 'Stage 1'
        sh 'echo $NVM_DIR'
        sh "ls -la"
        sh "nvm --version"
}