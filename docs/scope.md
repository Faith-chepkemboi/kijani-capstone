# Capstone Scope Document

## Problem Statement
kk-payments runs in a single environment, the default namespace on a local Minikube cluster. There is no staging environment, so a new version reaches the only live copy untested. A version change is made by hand: I edit the image tag in the manifest and run kubectl apply. Going back is also a hand edit. The only health signal is a yes/no "are you alive" probe, so I cannot say whether customers are actually being served well. This capstone adds a staging environment and an automated, gated path to production.

## Track
Track A (Infrastructure-first)

## What I Will Build
- Staging namespace: Terraform creates the kijani-staging namespace, and Ansible applies the environment settings to it.
- One manifest, two environments: the same kk-payments Deployment file is used in default and kijani-staging, with DB_HOST coming from a different ConfigMap in each.
- Pipeline: a merge to main makes Jenkins deploy to staging, run a smoke test, then pause for a named approver who must give a reason before production.
- Monitoring signal: a script reads the kk-payments structured logs and writes an error-rate summary to a file in the repository.
- Receipt chain: the three Week 10 serverless functions run locally, and kk-payments in staging writes to the kk-payments-receipts-staging bucket to start the chain.

## What Is Out of Scope
- Prometheus installation: I use the log-based error-rate option instead, because it needs no new software and counts the same.
- A real cloud deployment (AWS): Track A does not require it. Running locally avoids storing AWS keys in the cluster and keeps the work inside the three days available. Moving the receipt chain to AWS is part of my second pass.
- Ingress and TLS: the capstone needs staging and the gated pipeline, not public routing.
- A real database: DB_HOST is a setting the service reads and logs, so a database is not needed to prove configuration separation.
- Automatic rollback in production: rollback stays a manual step, and I list it as a known gap.

## Success Criteria
1. A merge to main starts Jenkins and deploys to kijani-staging with no manual step; the production approval prompt appears only after the smoke test passes, and the approver's reason shows in the build log.
2. kubectl get configmap in both namespaces shows a different DB_HOST, while both Deployments use the identical manifest file.
3. One request to staging kk-payments produces three log lines (kk-receipts, kk-processor, kk-notifier) carrying the same orderId.

## Architecture Diagram
See docs/architecture.png.