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

  stage("Deploy legacy frontend") {
    sh """
      cd frontend \
        && rm -rf build \
        && mkdir build \
        && docker run --rm $staticImage tar -C /usr/share/nginx -c html/ | tar -x -C build/ --strip-components=1 \
        && rsync -avH --chown root:conikuvat build/ root@nuoli.tracon.fi:/srv/conikuvat.fi/public_html
    """
  }

  stage("Push") {
    sh """
      docker tag $image conikuvat/edegal:latest && \
        docker push conikuvat/edegal:latest && \
        docker push $image && \
        docker rmi $image && \

      docker tag $frontendImage conikuvat/edegal:latest && \
        docker push conikuvat/edegal-frontend:latest && \
        docker push $frontendImage && \
        docker rmi $frontendImage && \

      docker tag $staticImage conikuvat/edegal:latest && \
        docker push conikuvat/edegal-static:latest && \
        docker push $staticImage && \
        docker rmi $staticImage
    """
  }

  stage("Deploy legacy") {
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
