# Kitten Companion — Local Dev Setup

Verified environment for this machine. Run these steps in order.

---

## Installed Tool Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Amazon Corretto | 21.0.11 LTS | Java runtime for all Lambda services |
| Maven | 3.9.16 | Java service builds |
| Node.js | v20.20.2 (via nvm) | Node Lambda services + frontend |
| npm | 10.8.2 | Node package management |
| Docker Desktop | 29.5.2 | Runs Postgres, Redis, LocalStack locally |
| AWS CLI | 2.34.57 | AWS resource management + log tailing |
| AWS SAM CLI | 1.161.1 | Local Lambda testing + deployment |
| psql | 18.4 | Database migrations + seeding |
| pgAdmin 4 | latest | GUI database client |

---

## Step 1 — Shell Environment

Add these to `~/.zshrc` if not already present, then run `source ~/.zshrc`:

```bash
# Amazon Corretto 21
export JAVA_HOME=/Library/Java/JavaVirtualMachines/amazon-corretto-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# psql client
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

# nvm (Node version manager)
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
```

Verify everything resolves correctly:

```bash
java --version        # OpenJDK 21.0.11 Corretto
mvn --version         # Apache Maven 3.9.16, Java version: 21.x
node --version        # v20.20.2
psql --version        # psql (PostgreSQL) 18.4
docker --version      # Docker version 29.5.2
aws --version         # aws-cli/2.34.57
sam --version         # SAM CLI, version 1.161.1
```

> **Maven + Java:** Maven was installed via Homebrew and picked up OpenJDK 26 as its default. After adding `JAVA_HOME` above and reloading your shell, `mvn --version` will show Java 21 (Corretto). Verify this before building any Java service.

---

## Step 2 — Environment File

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `DB_PASSWORD` | Use `devpassword` for local (matches docker-compose.yml) |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `SENDGRID_API_KEY` | SendGrid dashboard → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic console → API Keys |
| `AWS_ACCOUNT_ID` | `aws sts get-caller-identity --query Account` (after AWS CLI is configured) |

Leave `LOCALSTACK_ENDPOINT=http://localhost:4566` as-is for local dev.

---

## Step 3 — Start Local Infrastructure

Open Docker Desktop first, then:

```bash
docker compose up
```

Wait for all three containers to be healthy (takes ~30s on first run):

```
kittencompanion-postgres    ... healthy
kittencompanion-redis       ... healthy
kittencompanion-localstack  ... healthy
```

To check status:

```bash
docker compose ps
```

To view logs for a specific service:

```bash
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f localstack
```

---

## Step 4 — Run Database Migrations

With Postgres running:

```bash
./scripts/migrate.sh dev
```

Seed test data:

```bash
./scripts/seed.sh dev
```

Verify via psql:

```bash
psql -h localhost -p 5432 -U devuser -d newcat_dev
# Password: devpassword
```

Or connect via **pgAdmin 4**:
- Open pgAdmin 4 from `/Applications/pgAdmin 4.app`
- Add Server → Host: `localhost`, Port: `5432`, Username: `devuser`, Password: `devpassword`, DB: `newcat_dev`

---

## Step 5 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Available at `http://localhost:3000`

---

## Step 6 — Build a Java Service (example: pet)

```bash
cd services/pet
mvn clean package
mvn test
```

---

## Step 7 — Build a Node Service (example: auth)

```bash
cd services/auth
npm install
npm run build
npm test
```

---

## Stop Everything

```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers + wipe volumes (full reset)
```

---

## AWS CLI Setup (for real AWS deployments)

```bash
aws configure
# AWS Access Key ID: <from IAM>
# AWS Secret Access Key: <from IAM>
# Default region: us-east-1
# Default output format: json
```

For local dev with LocalStack, no real credentials are needed — LocalStack accepts any value.

---

## Quick Reference

| Service | Local URL |
|---------|-----------|
| Frontend | http://localhost:3000 |
| LocalStack (API Gateway) | http://localhost:4566 |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |
