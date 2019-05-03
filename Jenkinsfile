#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'
        sh '. ~/.bashrc'
        sh 'set +ex'
        sh 'export NVM_DIR="$HOME/.nvm"'
        sh '. ~/.nvm/nvm.sh && nvm current'
        sh 'set -ex'

    stage '🇧🇿 Build env version'
        sh 'nvm install 10'
        sh 'nvm use 10'
}