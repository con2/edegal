def image = "conikuvat/edegal:build-${env.BUILD_NUMBER}"
def frontendImage = "edegal-frontend:build-${env.BUILD_NUMBER}"
def buildVolume = "edegal-frontend-build-${env.BUILD_NUMBER}"

node {
  stage("Build") {
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

  stage("Deploy frontend") {
    // TODO these should probably be in some Dockerfile
    sh """
      cd frontend \
        && rm -rf build \
        && docker build --tag $frontendImage . \
        && docker run --rm --volume $buildVolume:/usr/src/app/build --env NODE_ENV=production $frontendImage yarn run build \
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
