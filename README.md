# QuickVote: End-to-End CI/CD Pipeline

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_App-blue?style=for-the-badge)](https://quickvote-pmjl.onrender.com/)

**Live Application:** [https://quickvote-pmjl.onrender.com/](https://quickvote-pmjl.onrender.com/)

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
* **Cloud Hosting**: Render

---

## 🏗 CI/CD Pipeline Stages

The Jenkins pipeline (`jenkinsfile`) defines the following automated stages:

1.  **Clone**: Fetches the latest code from the GitHub repository `main` branch.
2.  **Build**: Creates a Docker image named `ete-cicd` from the provided multi-stage `Dockerfile`.
3.  **Test**: Runs the unit and integration tests inside a temporary container to validate the build (`npm test`).
4.  **Push to DockerHub**: Authenticates securely, tags the image with the unique build number and `latest` tag, then pushes it to the DockerHub registry.
5.  **Deploy**: Uses Docker Compose to pull the latest image and restart the application service.

---

## 🔧 Installation & Setup

### Prerequisites
* Docker and Docker Compose installed
* Jenkins server with Docker and Pipeline plugins
* DockerHub account (credentials configured in Jenkins as `dockerhub`)

### Running Locally with Docker Compose
To spin up the application immediately using the pre-built image:
```bash
docker compose up -d
