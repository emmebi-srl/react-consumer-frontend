#!/usr/bin/env groovy

node('master') {

    stage 'Checkout'
        checkout scm

    stage 'Load profiles'
        sh 'source . ~/.nvm/nvm.sh'
        sh 'source . ~/.bash_profile'

    stage '\u2776 Stage 1'
        echo "\u2600 lol"
        sh "ls -la"
        sh "nvm --version"
}