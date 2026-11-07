pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  // Jenkins checks GitHub every ~2 minutes (GitHub cannot reach localhost to tell us)
  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    // Secret file credential stored in Jenkins; KUBECONFIG becomes the path to it
    KUBECONFIG = credentials('minikube-kubeconfig')
    // Jenkins usernames allowed to approve production (comma-separated)
    APPROVER_USERS = 'jenkins'
  }

  stages {
    stage('Check prerequisites') {
      steps {
        sh '''
          kubectl get namespace kijani-staging
          kubectl get configmap kk-payments-config -n kijani-staging
          kubectl get secret kijani-registry-credentials -n kijani-staging
        '''
      }
    }

    stage('Deploy to staging') {
      steps {
        script {
          sh 'kubectl apply -n kijani-staging -f k8s/'
          try {
            sh 'kubectl rollout status deployment/kk-payments -n kijani-staging --timeout=120s'
          } catch (err) {
            sh 'kubectl rollout undo deployment/kk-payments -n kijani-staging || true'
            error("Staging rollout failed and was rolled back: ${err}")
          }
        }
      }
    }

    stage('Smoke test staging') {
      steps {
        sh '''
          RESPONSE=$(kubectl exec -n kijani-staging deploy/kk-payments -- wget -qO- http://127.0.0.1:3001/health)
          echo "Health response: $RESPONSE"
          echo "$RESPONSE" | grep -q '"status":"ok"'
          DB=$(kubectl exec -n kijani-staging deploy/kk-payments -- printenv DB_HOST)
          echo "DB_HOST in staging: $DB"
          [ "$DB" = "db.staging.kijani.internal" ]
        '''
      }
    }

    stage('Approve production') {
      steps {
        script {
          def approval = null
          timeout(time: 30, unit: 'MINUTES') {
            approval = input(
              message: 'Staging passed the smoke test. Deploy kk-payments to production?',
              ok: 'Deploy to production',
              submitter: env.APPROVER_USERS,
              submitterParameter: 'APPROVER',
              parameters: [
                text(name: 'APPROVAL_REASON', description: 'Why are you approving this? (recorded in the build log)')
              ]
            )
          }
          if (!approval.APPROVAL_REASON?.trim()) {
            error('Approval needs a reason.')
          }
          echo "APPROVED by ${approval.APPROVER}. Reason: ${approval.APPROVAL_REASON}"
        }
      }
    }

    stage('Deploy to production') {
      steps {
        script {
          sh 'kubectl apply -n default -f k8s/'
          try {
            sh 'kubectl rollout status deployment/kk-payments -n default --timeout=120s'
          } catch (err) {
            sh 'kubectl rollout undo deployment/kk-payments -n default || true'
            error("Production rollout failed and was rolled back: ${err}")
          }
        }
      }
    }
  }

  post {
    always {
      echo "Build ${env.BUILD_NUMBER} finished: ${currentBuild.currentResult}"
    }
  }
}