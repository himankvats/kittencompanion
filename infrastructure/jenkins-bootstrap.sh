#!/bin/bash
# infrastructure/jenkins-bootstrap.sh
# EC2 UserData for the Kitten Companion Jenkins controller (Amazon Linux 2023).
# Installs the full build/deploy toolchain + Jenkins so the box is reproducible.
# This is embedded into jenkins.yaml UserData; keep it self-contained and idempotent.
#
# After boot:
#   - Jenkins UI: http://<public-ip>:8080
#   - Initial admin password: /var/lib/jenkins/secrets/initialAdminPassword
#   - Verify toolchain: sudo -u jenkins bash -lc 'java -version; node -v; mvn -v; sam --version; psql --version; aws --version'

set -euxo pipefail

# ---- Base packages ----
dnf update -y
dnf install -y git make tar gzip unzip python3 jq postgresql15

# ---- Java 21 Corretto (Jenkins needs 17+, our Java Lambdas need 21) ----
dnf install -y java-21-amazon-corretto-devel
# Make 21 the default for the jenkins user's builds.
JAVA21_HOME=$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")
echo "export JAVA_HOME=${JAVA21_HOME}" > /etc/profile.d/java21.sh

# ---- Node.js 20 (runtime for building Node services; nodejs24 runtime is set in SAM) ----
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# ---- Maven ----
MAVEN_VERSION=3.9.9
curl -fsSL "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" \
  -o /tmp/maven.tar.gz
tar -xzf /tmp/maven.tar.gz -C /opt
ln -sfn "/opt/apache-maven-${MAVEN_VERSION}" /opt/maven
cat >/etc/profile.d/maven.sh <<'EOF'
export M2_HOME=/opt/maven
export PATH=${M2_HOME}/bin:${PATH}
EOF

# ---- AWS CLI v2 ----
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install --update

# ---- AWS SAM CLI ----
curl -fsSL "https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip" \
  -o /tmp/sam.zip
unzip -q /tmp/sam.zip -d /tmp/sam-installation
/tmp/sam-installation/install --update

# ---- Docker (optional; only needed if you re-enable sam build --use-container) ----
dnf install -y docker
systemctl enable --now docker

# ---- Jenkins ----
curl -fsSL https://pkg.jenkins.io/redhat-stable/jenkins.repo -o /etc/yum.repos.d/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
dnf install -y jenkins

# Let the jenkins user run docker (only matters if --use-container is enabled).
usermod -aG docker jenkins || true

systemctl enable jenkins
systemctl start jenkins

echo "Jenkins bootstrap complete. Initial admin password:"
cat /var/lib/jenkins/secrets/initialAdminPassword || true
