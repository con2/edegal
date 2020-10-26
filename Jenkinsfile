def environmentMap = [
  "development": "staging",
  "master": "production",
]

pipeline {
  agent any

  environment {
    PYTHONUNBUFFERED = "1"
  }

  stages {
    stage("Build") {
      steps {
        sh "emskaffolden -E ${environmentMap[env.BRANCH_NAME]} -- build --default-repo=harbor.con2.fi/con2 --file-output build.json"
      }
    }

    stage("Deploy") {
      steps {
        sh "emskaffolden -E ${environmentMap[env.BRANCH_NAME]} -- deploy -n conikuvat-${environmentMap[env.BRANCH_NAME]} -a=build.json"
      }
    }
  }

  post {
    always {
      archiveArtifacts "build.json"
      archiveArtifacts "kubernetes/template.compiled.yaml"
    }
  }
}
