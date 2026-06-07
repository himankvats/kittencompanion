// Jenkinsfile — Kitten Companion CI/CD
// Declarative pipeline for the in-VPC Jenkins controller (see infrastructure/jenkins.yaml).
//
// Flow: checkout -> lint -> unit tests -> build -> [manual approval for prod] -> deploy -> migrate -> smoke
//
// AWS auth comes from the EC2 instance profile (kitten-companion-jenkins-role-*),
// so there is NO credential binding here — that's the payoff of running in-VPC.
// Migrations reach RDS directly over the VPC (no SSM/bastion).

// TRIGGERING (intentional design): there is NO triggers{} block here. The prod
// pipeline is started MANUALLY ("Build with Parameters" -> ENVIRONMENT=prod), then
// gated by the Approve stage. The GitHub webhook is configured for branch/PR
// DISCOVERY ONLY (it keeps the multibranch job's branch list current) and must not
// auto-start builds — see PROD_DEPLOYMENT.md "How the pipeline is triggered".
// Do not add githubPush()/pollSCM() here: that would let a push deploy toward prod.

pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['prod', 'dev'],
            description: 'Target environment. On a multibranch job, default this from the branch (main->prod, DEV->dev).'
        )
        string(
            name: 'AWS_REGION',
            defaultValue: 'us-east-1',
            description: 'AWS region'
        )
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 90, unit: 'MINUTES')
    }

    // Corretto 21 + Maven land in /etc/profile.d/*.sh via the bootstrap. Rather than
    // resolve JAVA_HOME at parse time (brittle), the build/test stages run their
    // shells as LOGIN shells (bash -l) so those profile scripts are sourced.

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint') {
            steps {
                // login shell so Node/Maven from /etc/profile.d are on PATH
                sh 'bash -lc "make lint-all"'
            }
        }

        stage('Unit tests') {
            steps {
                sh 'bash -lc "make test-all"'
            }
            post {
                always {
                    // Java (Surefire) results. Node services using jest-junit will also match if configured.
                    junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Build') {
            // Build BEFORE the approval gate so the artifacts are ready the moment it's approved.
            // Login shell so npm/mvn/sam from /etc/profile.d are on PATH.
            steps {
                sh "bash -lc 'infrastructure/scripts/deploy.sh ${params.ENVIRONMENT} ${params.AWS_REGION} build'"
            }
        }

        stage('Approve prod deploy') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Deploy to PRODUCTION?', ok: 'Approve', submitter: 'himankvats'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh "bash -lc 'infrastructure/scripts/deploy.sh ${params.ENVIRONMENT} ${params.AWS_REGION} deploy'"
            }
        }

        stage('Migrate') {
            steps {
                sh "bash -lc 'infrastructure/scripts/migrate.sh ${params.ENVIRONMENT} ${params.AWS_REGION}'"
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    set -e
                    STACK="kittencompanion-${ENVIRONMENT}"
                    API=$(aws cloudformation describe-stacks \
                        --stack-name "$STACK" --region "${AWS_REGION}" \
                        --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
                        --output text)
                    echo "API endpoint: $API"

                    # Hit /auth/signup with a throwaway address. Tolerate a cold start
                    # (Java/VPC) with retries; FAIL only on 5xx / no response.
                    EMAIL="ci-smoke-$(date +%s)@example.com"
                    ok=0
                    for i in 1 2 3 4 5; do
                      code=$(curl -s -o /tmp/smoke.out -w "%{http_code}" \
                        -X POST "$API/auth/signup" \
                        -H "Content-Type: application/json" \
                        -d "{\\"email\\":\\"$EMAIL\\",\\"first_name\\":\\"CI\\",\\"last_name\\":\\"Smoke\\"}" || echo 000)
                      echo "attempt $i -> HTTP $code"
                      if [ "$code" != "000" ] && [ "$code" -lt 500 ]; then ok=1; break; fi
                      sleep 10
                    done
                    if [ "$ok" -ne 1 ]; then
                      echo "Smoke test FAILED (no non-5xx response from /auth/signup)"; cat /tmp/smoke.out || true; exit 1
                    fi
                    echo "Smoke test passed (API reachable)."
                '''
            }
        }
    }

    post {
        failure {
            // Requires SMTP configured in Jenkins (Manage Jenkins > E-mail Notification).
            // Wrapped so a missing SMTP config doesn't mask the real failure.
            script {
                try {
                    mail to: 'himankvats@gmail.com',
                         subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${params.ENVIRONMENT})",
                         body: "Pipeline failed. See ${env.BUILD_URL}"
                } catch (err) {
                    echo "Build failed; e-mail notification skipped (SMTP not configured): ${err}"
                }
            }
        }
        success {
            echo "Deploy to ${params.ENVIRONMENT} succeeded."
        }
        always {
            cleanWs()
        }
    }
}
