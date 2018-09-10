def image = "conikuvat/edegal:build-${env.BUILD_NUMBER}"
def frontendImage = "conikuvat/edegal-frontend:build-${env.BUILD_NUMBER}"
def staticImage = "conikuvat/edegal-static:build-${env.BUILD_NUMBER}"

node {
  stage("Build backend") {
    checkout scm
    sh "cd backend && docker build --tag $image ."
  }

// stage("Test") {
//   node {
//     sh """
//       docker run \
//         --rm \
//         --link jenkins.conikuvat.fi-postgres:postgres \
//         --env-file ~/.edegal.env \
//         $image \
//         python manage.py test --keepdb
//     """
//   }
// }

  stage("Build frontend") {
    sh "cd frontend && docker build --tag $frontendImage ."
  }

  stage("Build static") {
    sh "cd frontend && docker build --file Dockerfile.static --build-arg FRONTEND_IMAGE=$frontendImage --tag $staticImage ."
  }

  stage("Deploy frontend") {
    // TODO these should probably be in some Dockerfile
    sh """
      cd frontend \
        && rm -rf build \
        && docker build --tag $frontendImage . \
        && docker run --rm --volume $buildVolume:/usr/src/app/build --env NODE_ENV=production --user root $frontendImage npm run build \
        && docker run --rm --volume $buildVolume:/usr/src/app/build $frontendImage tar -c build/ | tar -x \
        && docker volume rm $buildVolume \
        && docker rmi $frontendImage \
        && find build -type f \\! -iname '*.gz' -exec gzip -k \\{\\} + \
        && rsync -avH --chown root:conikuvat build/ root@nuoli.tracon.fi:/srv/conikuvat.fi/public_html \
    """
  }

  stage("Push") {
    sh "docker tag $image conikuvat/edegal:latest && docker push conikuvat/edegal:latest && docker rmi $image"
  }

  stage("Deploy") {
    git url: "git@github.com:tracon/ansible-tracon"
    sh """
      ansible-playbook \
        --vault-password-file=~/.vault_pass.txt \
        --user root \
        --limit nuoli.tracon.fi \
        --tags edegal-deploy \
        tracon.yml
    """
  }
}
