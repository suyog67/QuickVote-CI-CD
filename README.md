# 🗳️ QuickVote — Live Polling App with Full CI/CD Pipeline

![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)
![Jest](https://img.shields.io/badge/Tested-Jest-C21325?logo=jest&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_App-blue?style=for-the-badge)](https://quickvote-pmjl.onrender.com/)
**Live Application:** [https://quickvote-pmjl.onrender.com/](https://quickvote-pmjl.onrender.com/)

A lightweight, real-time polling web application built with **Node.js + Express** and a vanilla JS frontend. The project ships with a complete **Jenkins CI/CD pipeline** — from source code to Docker image to live deployment — with automated testing and email notifications at every stage.

---

## 📸 Preview

> Dark-themed, grid-lined UI with live vote bars, percentage breakdowns, and instant results — all without a page reload.

---

## ✨ Features

- **Create polls** with a custom question and up to 8 options
- **Real-time vote results** with animated progress bars and percentages
- **Duplicate vote prevention** using per-session voter tokens
- **Auto-refresh** every 10 seconds to keep results current
- **Delete polls** with a single click
- **Health check endpoint** for CI/CD and monitoring
- **Zero-database architecture** — fully in-memory, no setup required
- **Containerised** with a multi-stage Docker build for a small, production-ready image

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18, Express 4 |
| Frontend | Vanilla HTML / CSS / JavaScript (SPA) |
| Testing | Jest 29, Supertest |
| Containerisation | Docker (multi-stage), Docker Compose |
| CI/CD | Jenkins Declarative Pipeline |
| Registry | Docker Hub |

---

## 📁 Project Structure

```
QuickVote-CI-CD/
├── public/
│   └── index.html        # Single-page frontend (HTML + CSS + JS)
├── server.js             # Express API server
├── server.test.js        # Jest + Supertest test suite
├── package.json          # NPM scripts and dependencies
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yaml   # Production deployment config
└── jenkinsfile           # Jenkins CI/CD pipeline definition
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the repository

```bash
git clone https://github.com/suyog67/QuickVote-CI-CD.git
cd QuickVote-CI-CD
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The app will be available at **http://localhost:3000**

### 4. Run tests

```bash
npm test
```

Jest will run the full test suite with coverage report.

---

## 🐳 Running with Docker

### Build and run the container

```bash
docker build -t quickvote .
docker run -p 3000:3000 quickvote
```

### Or use Docker Compose (pulls from Docker Hub)

```bash
docker compose up -d
```

> The Compose file uses the pre-built image `suyogkulkarni90/votingapp:latest` and maps port `3000`.

---

## 🔌 API Reference

All endpoints return JSON. The base URL is `http://localhost:3000`.

### Health Check

```
GET /health
```
```json
{ "status": "ok", "uptime": 42.5, "polls": 3 }
```

---

### Get all polls

```
GET /api/polls
```
```json
{
  "polls": [
    {
      "id": "uuid",
      "title": "Best language?",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "totalVotes": 5,
      "options": [
        { "id": "uuid", "text": "JavaScript", "votes": 3, "percentage": 60 },
        { "id": "uuid", "text": "Python",     "votes": 2, "percentage": 40 }
      ]
    }
  ]
}
```

---

### Get a single poll

```
GET /api/polls/:id
```

Returns a single poll object (same shape as above) or `404` if not found.

---

### Create a poll

```
POST /api/polls
Content-Type: application/json

{
  "title": "Best framework?",
  "options": ["React", "Vue", "Angular"]
}
```

**Validation rules:**
- `title` is required and must be a non-empty string
- `options` must be an array with at least 2 non-empty entries

Returns `201` with the created poll on success.

---

### Cast a vote

```
POST /api/polls/:id/vote
Content-Type: application/json

{
  "optionId": "<option-uuid>",
  "voterToken": "<unique-session-token>"
}
```

- `optionId` is required
- `voterToken` is optional but enables duplicate-vote prevention — the same token cannot vote twice on the same poll
- Returns `409 Conflict` if the voter has already voted

---

### Delete a poll

```
DELETE /api/polls/:id
```

Returns `200` with a confirmation message, or `404` if the poll doesn't exist.

---

## 🧪 Test Suite

The test suite covers all major API behaviours using **Jest** and **Supertest**. State is cleared between each test to guarantee isolation.

| Test Group | Scenarios Covered |
|---|---|
| `GET /health` | Returns `status: ok` |
| `GET /api/polls` | Empty list, list after creation |
| `POST /api/polls` | Success, missing title, < 2 options, empty options array |
| `GET /api/polls/:id` | Found, not found (404) |
| `POST /api/polls/:id/vote` | Registers vote, prevents double voting, invalid option, unknown poll, percentage calculation |
| `DELETE /api/polls/:id` | Deletes successfully, 404 on ghost poll |

---

## ⚙️ CI/CD Pipeline (Jenkins)

The `jenkinsfile` defines a fully automated five-stage pipeline:

```
Clone → Build → Test → Push to DockerHub → Deploy
```

### Pipeline Stages

#### 1. 🔄 Clone
Pulls the latest code from the `main` branch of the repository.

#### 2. 🔨 Build
Builds a Docker image tagged `ete-cicd`:

```bash
docker build -t ete-cicd .
```

#### 3. ✅ Test
Runs the Jest test suite inside a temporary container to keep the host clean:

```bash
docker run --rm -e CI=true ete-cicd npm test
```

The pipeline **fails fast** here — no broken code gets pushed.

#### 4. 📦 Push to DockerHub
On a passing test run, the image is tagged with both the Jenkins `BUILD_NUMBER` and `latest`, then pushed to Docker Hub:

```bash
docker tag ete-cicd $USER/votingapp:$BUILD_NUMBER
docker tag ete-cicd $USER/votingapp:latest
docker push $USER/votingapp:$BUILD_NUMBER
docker push $USER/votingapp:latest
```

Credentials are managed securely through Jenkins' credential store (never hardcoded).

#### 5. 🚀 Deploy
Brings the new container live on the host server:

```bash
docker compose down
docker compose up -d
```

### Post-Build Notifications

Jenkins sends an email notification automatically:

| Outcome | Email Subject |
|---|---|
| ✅ Success | `Build #N Successful` |
| ❌ Failure | `Build #N Failed` |

### Setting Up Jenkins

1. Ensure Jenkins has the **Docker Pipeline** and **Email Extension** plugins installed.
2. Add Docker Hub credentials in Jenkins under the ID `dockerhub`.
3. Configure the SMTP server under **Manage Jenkins → Configure System**.
4. Create a new **Pipeline** job and point it to this repository's `jenkinsfile`.

---

## 🐳 Dockerfile — Multi-Stage Build

```dockerfile
# Stage 1 — Install dependencies
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2 — Lean production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "server.js"]
```

The builder stage installs all dependencies (including dev tools). Only the final artifacts are copied into the slim `node:18-alpine` image, keeping the production image small and secure.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                     │
│           public/index.html  ←→  /api/*             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│              Express Server (server.js)              │
│                                                      │
│  GET  /health           — uptime + poll count        │
│  GET  /api/polls        — all polls                  │
│  GET  /api/polls/:id    — single poll                │
│  POST /api/polls        — create poll                │
│  POST /api/polls/:id/vote — cast vote                │
│  DEL  /api/polls/:id    — delete poll                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          In-Memory Store (polls + voters)            │
│      polls{}  — poll data keyed by UUID              │
│      voters{} — Set of voter tokens per poll         │
└─────────────────────────────────────────────────────┘
```

---


<p align="center">Built with ❤️ by <a href="https://github.com/suyog67">suyog67</a></p>
