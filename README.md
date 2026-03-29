# QuickVote: End-to-End CI/CD Pipeline

QuickVote is a real-time, Node.js-based voting application designed to demonstrate a complete DevOps lifecycle. This project focuses on automating the integration, testing, and deployment processes using modern containerization and CI/CD tools.

## 🚀 Project Overview

This repository showcases a fully automated pipeline that takes the application from source code to a production-ready containerized environment. The application is a RESTful API built with Express.js that allows users to create polls, cast votes, and view real-time results.

### Key DevOps Features
* **Containerization**: Uses Docker for consistent environments across development and production.
* **Multi-Stage Builds**: Optimized Docker images using a build-and-run approach to keep the final production image lightweight.
* **CI/CD Automation**: A Jenkins pipeline handles the entire flow: cloning, building, testing, pushing to DockerHub, and deploying.
* **Infrastructure as Code**: Deployment is managed via `docker-compose.yaml` for easy orchestration.
* **Automated Testing**: Integrated Jest testing suite within the pipeline to ensure code quality before deployment.

---

## 🛠 Tech Stack

* **Backend**: Node.js, Express.js
* **Testing**: Jest, Supertest
* **CI/CD**: Jenkins
* **Containerization**: Docker, Docker Compose
* **Registry**: DockerHub

---

## 🏗 CI/CD Pipeline Stages

The Jenkins pipeline defines the following automated stages:

1.  **Clone**: Fetches the latest code from the GitHub repository.
2.  **Build**: Creates a Docker image named `ete-cicd` from the provided Dockerfile.
3.  **Test**: Runs the unit and integration tests inside a temporary container to validate the build.
4.  **Push to DockerHub**: Tags the image with the unique build number and `latest` tag, then pushes it to the DockerHub registry.
5.  **Deploy**: Uses Docker Compose to pull the latest image and restart the application service.

---

## 🔧 Installation & Setup

### Prerequisites
* Docker and Docker Compose installed
* Jenkins server with Docker and Pipeline plugins
* DockerHub account and credentials configured in Jenkins as `dockerhub`

### Running Locally with Docker
To spin up the application immediately:
```bash
docker compose up -d
```
The app will be accessible at `http://localhost:3000`.

### Manual Build
```bash
docker build -t voting-app .
docker run -p 3000:3000 voting-app
```

---

## 🧪 Testing
The project includes a comprehensive test suite using Jest. You can run tests locally using:
```bash
npm test
```
This executes tests and generates a coverage report to ensure all API endpoints (Poll creation, Voting, Health checks) are functioning as expected.

---

## 📩 Notifications
The pipeline is configured to send automated email notifications to `suyogg6cc@gmail.com` upon build success or failure, ensuring rapid response to pipeline status.
