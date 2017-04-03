def image = "conikuvat/edegal:build-${env.BUILD_NUMBER}"

stage("Build") {
  node {
    checkout scm
    sh "cd backend && docker build --tag ${image} ."
  }
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
  node {
    sh "docker tag ${image} conikuvat/edegal:latest && docker push conikuvat/edegal:latest && docker rmi ${image}"
  }
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
