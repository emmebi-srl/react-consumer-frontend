#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh '. ~/.nvm/nvm.sh'
        sh '. ~/.bash_profile'

    stage '🇧🇿 Build env version'
        sh 'nvm install 10'
        sh 'nvm use 10'
}