def imageMap = [
  "development": "staging",
  "master": "latest"
]

def environmentNameMap = [
  "master": "production",
  "development": "staging"
]

def tag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
def environmentName = environmentNameMap[env.BRANCH_NAME]

def tempBackendImage = "conikuvat/edegal-backend:${tag}"
def finalBackendImage = "conikuvat/edegal-backend:${imageMap[env.BRANCH_NAME]}"

def tempFrontendImage = "conikuvat/edegal-frontend:${tag}"
def finalFrontendImage = "conikuvat/edegal-frontend:${imageMap[env.BRANCH_NAME]}"

def tempStaticImage = "conikuvat/edegal-static:${tag}"
def finalStaticImage = "conikuvat/edegal-static:${imageMap[env.BRANCH_NAME]}"


node {
  stage("Build backend") {
    checkout scm
    sh "cd backend && docker build --tag $tempBackendImage ."
  }

// stage("Test") {
//   node {
//     sh """
//       docker run \
//         --rm \
//         --link jenkins.conikuvat.fi-postgres:postgres \
//         --env-file ~/.edegal.env \
//         $tempBackendImage \
//         python manage.py test --keepdb
//     """
//   }
// }

  stage("Build frontend") {
    sh "cd frontend && docker build --tag $tempFrontedImage ."
  }

  stage("Build static") {
    sh "cd frontend && docker build --file Dockerfile.static --build-arg FRONTEND_IMAGE=$tempFrontedImage --build-arg BACKEND_IMAGE=$tempBackendImage --tag $tempStaticImage ."
  }

  stage("Push") {
    sh """
      docker tag $tempBackendImage $finalBackendImage && \
        docker push $finalBackendImage && \
        docker push $tempBackendImage && \
        docker rmi $tempBackendImage && \

      docker tag $tempFrontendImage $finalFrontendImage && \
        docker push $finalFrontendImage && \
        docker push $tempFrontendImage && \
        docker rmi $tempFrontendImage && \

      docker tag $tempStaticImage $finalStaticImage && \
        docker push $finalStaticImage && \
        docker push $tempStaticImage && \
        docker rmi $tempStaticImage
    """
  }

  stage("Deploy") {
    if (env.BRANCH_NAME == "development") {
      // Kubernetes deployment
      sh """
        emrichen kubernetes/template.in.yml \
          -f kubernetes/${environmentName}.vars.yml \
          -D conikuvat_tag=${tag} | \
        kubectl apply -n conikuvat-${environmentName} -f -
      """
    } else {
      // Legacy deployment
      sh """
        cd frontend \
          && rm -rf build \
          && mkdir build \
          && docker run --rm $finalStaticImage tar -C /usr/share/nginx -c html/ | tar -x -C build/ --strip-components=1 \
          && rsync -avH --chown root:conikuvat build/ root@nuoli.tracon.fi:/srv/conikuvat.fi/public_html
      """

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
}
