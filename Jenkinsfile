#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'

    stage '\u2776 Stage 1'
        echo $NVM_DIR
        sh "ls -la"
        sh "nvm --version"
}