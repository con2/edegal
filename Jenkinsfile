def image = "conikuvat/edegal:build-${env.BUILD_NUMBER}"
def frontendImage = "edegal-frontend:build-${env.BUILD_NUMBER}"

node {
  stage("Build") {
    checkout scm
    sh "cd backend && docker build --tag ${image} ."
  }

  stage("Build frontend") {
    sh "cd frontend && rm -rf build && mkdir build && docker build --tag ${frontendImage} . && docker run --rm ${frontendImage} --volume ./build:/usr/src/app/build --env NODE_ENV=production yarn run build && find build -type f \! -iname '*.gz' -exec gzip -k \{\} + && tar -cvf ../frontend.tar -C build/ ."
    archiveArtifacts artifacts: "frontend.tar", fingerprint: true
  }

// stage("Test") {
//   node {
//     sh """
//       docker run \
//         --rm \
//         --link jenkins.conikuvat.fi-postgres:postgres \
//         --env-file ~/.edegal.env \
//         ${image} \
//         python manage.py test --keepdb
//     """
//   }
// }

  stage("Push") {
    sh "docker tag ${image} conikuvat/edegal:latest && docker push conikuvat/edegal:latest && docker rmi ${image}"
  }

// stage("Deploy") {
//   node {
//     git url: "git@github.com:tracon/ansible-tracon"
//     sh """
//       ansible-playbook \
//         --vault-password-file=~/.vault_pass.txt \
//         --user root \
//         --limit neula.kompassi.eu \
//         --tags edegal-deploy \
//         tracon.yml
//     """
//   }
// }
