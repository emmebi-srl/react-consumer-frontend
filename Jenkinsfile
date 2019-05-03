#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'NVM installation'
        sh 'nvm current || echo "NVM is being installed" &&  touch ~/.profile && curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh -o install_nvm.sh && bash install_nvm.sh'
        sh 'export NVM_DIR="$HOME/.nvm"'
        sh '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'
        sh '[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"'

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'
        sh 'echo $NVM_DIR'

    stage 'Stage 1'
        sh 'echo $NVM_DIR'
        sh "ls -la"
        sh "nvm --version"
}