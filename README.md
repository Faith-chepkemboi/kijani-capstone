# KijaniKiosk Capstone: Track A (Infrastructure-first)

## 1. What is this?
kk-payments is the KijaniKiosk payments service. Until now it ran in one place only, the default namespace on a local Minikube cluster, and a person edited the version by hand to release it. This project adds a staging environment (the kijani-staging namespace) and a Jenkins pipeline that deploys to staging first, runs a smoke test, and only then asks a named person to approve production. It also connects kk-payments in staging to the Week 10 receipt chain and adds an error-rate check built from the service logs.

## 2. Architecture
![Architecture diagram](docs/architecture.png)

- Jenkins: watches this repository and runs the pipeline when main changes.
- Terraform: creates the kijani-staging namespace.
- Ansible: applies the staging environment settings.
- Minikube: runs kk-payments in two namespaces (kijani-staging and default/production) from the same Deployment file, each with its own ConfigMap.
- GHCR: stores the kk-payments image.
- Receipt chain: three serverless functions (kk-receipts, kk-processor, kk-notifier) run locally and pass files through three buckets.
- Monitoring script: reads the kk-payments logs and writes an error-rate summary.

## 3. Prerequisites
TODO: fill in the versions after checking each tool on the machine.
- Docker
- Minikube and kubectl
- Terraform
- Ansible
- Jenkins (running in a Docker container on port 8080)
- Node.js and the Serverless Framework (for the receipt chain)
- A GitHub token stored in Jenkins as a credential, never in this repository

## 4. Setup
TODO: exact commands, in order, from a clean machine. Written as each part is built.

## 5. How to run the pipeline
TODO: how a merge to main triggers Jenkins, what each stage does, and where the approval prompt appears.

## 6. How to verify it works
TODO: the commands that prove the three success criteria in docs/scope.md.

## 7. Known limitations
- Everything runs on one laptop, so losing the machine loses both environments.
- Rollback in production is still a manual step.
- The receipt chain runs locally, not on a cloud provider.
- DB_HOST is a setting only; there is no real database behind it.