# Aries Web APP

## How to build
To create a build you can use one of de following commands:
 * `npm run build:dev`
 * `npm run build:prod:emmebi`
 * `npm run build:prod:siantel`

### Docker image
To create a docker image run the following command:
`docker build --file ./Dockerfile --tag aries-web-app:{target-version} .`

Where {target-version} is the versione of the current image.
Target version should be respect the following naming structure: `x.y.z` for example `0.0.1`

To run locally the image run the following command:
`docker run -d --name aries-web-app -p9200:9200 aries-web-app:{target-version}`

When a new image is ready to be released you need to push it in docker hub. 
First of all make sure you are logged in in docker;
Use the command `docker login` with the followings credentials (user docker logout if you are not sure which account is logged in):

Username: `emmebi`
Password: `jhyjaSLRV5KXjMjk`

Now you can push create all the tag:

`docker tag aries-web-app:{target-version} emmebi/aries-web-app:{target-version}`
`docker tag aries-web-app:{target-version} emmebi/aries-web-app:latest`


And now you are able to push all tags to the DockerHub:

`docker push emmebi/aries-web-app:{target-version}`
`docker push emmebi/aries-web-app:latest`
