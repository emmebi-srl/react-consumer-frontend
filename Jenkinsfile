#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'

    stage '🇧🇿 Stage 1'
        sh 'echo $NVM_DIR'
        sh "ls -la"
        sh "~/.nvm/nvm.sh --version"
}