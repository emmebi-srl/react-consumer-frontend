#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'
        sh 'echo $NVM_DIR'

    stage 'Stage 1'
        sh 'echo $NVM_DIR'
        sh "ls -la"
        sh "nvm --version"
}