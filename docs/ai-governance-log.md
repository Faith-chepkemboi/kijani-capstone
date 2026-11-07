# AI Governance Log

Every entry uses the eight-field format from the Week 10 capstone guide.

## Entry 1: Pull request description

1. Date: 2026-11-07
2. Tool used: Claude
3. Task description: Write the description for my first pull request (the Track A folder structure).
4. What was provided to the AI: The list of folders I created and that each empty folder holds a .gitkeep file.
5. What the AI produced: A three-part description (what changed, why, how to check).
6. What it got right: The reason for .gitkeep files and the "how to check" command.
7. What it got wrong: It said docs/ had a .gitkeep file, but docs/ was empty so Git did not commit it. Only four folders were in the commit. It also read as AI-written.
8. What I changed before applying the output: I removed the docs/ claim, said the docs folder comes with the scope document, and rewrote it in plainer first-person wording.

## Entry 2: Scope document

1. Date: 2026-11-07
2. Tool used: Claude
3. Task description: Draft the one-page capstone scope document for Track A.
4. What was provided to the AI: My Week 8 write-up of what the system does not solve, the capstone pages, and my choice of Track A. I did not answer its three scoping questions, so it used its own defaults (a setting-only DB_HOST and the receipt chain in scope).
5. What the AI produced: A full draft with the problem statement, five in-scope items, out-of-scope items and three success criteria.
6. What it got right: The structure from the course template, measurable success criteria that can be shown in a demo, and keeping to five in-scope items.
7. What it got wrong: It wrote that a real cloud deployment was out of scope because "there is no cloud account". That was an assumption. I do have an AWS account, so the reason was false.
8. What I changed before applying the output: I corrected the reason to the true one: keeping AWS keys out of the cluster and the three-day time limit, and I moved AWS to my second pass.


## Entry 3: Architecture diagram

1. Date: 2026-11-07
2. Tool used: Claude
3. Task description: Draw the first architecture diagram for the scope document.
4. What was provided to the AI: The scope document, the Week 8 setup (Minikube, Jenkins, GHCR) and the Week 10 receipt chain pages.
5. What the AI produced: A PNG diagram (made with a script) showing Jenkins, GitHub, the two namespaces, the ConfigMaps, the receipt chain, and the monitoring script, with every arrow labelled.
6. What it got right: Every component from the scope appears, every arrow says what flows across it, and the pipeline steps are numbered 1 to 5 in order.
7. What it got wrong: The first drafts had overlapping labels, and the staging and production kubectl apply arrows both ended at the cluster edge so you could not tell which went where. The Terraform arrow pointed at the pod instead of the namespace. It also drew the receipt chain from the course pages without checking that the course serverless.yml really wires the functions in that order, so that part is unverified.
8. What I changed before applying the output: I saved it unchanged as the first version. On Monday I will compare every arrow with the running system and redraw wherever it differs.

## Entry 4: Terraform for the staging namespace

1. Date: 2026-11-07
2. Tool used: Claude
3. Task description: Write Terraform that creates the kijani-staging namespace on Minikube.
4. What was provided to the AI: The scope document and the course folder layout (main.tf, variables.tf, outputs.tf).
5. What the AI produced: A Kubernetes provider block, one namespace resource with two labels, three variables and one output, plus a .gitignore for Terraform state.
6. What it got right: terraform validate passed, the plan showed exactly one resource to add, and no secrets are in the code (checklist control 3).
7. What it got wrong: Running the six-point governance checklist found three gaps. Control 1: it uses the full admin kubeconfig, not a limited account. Control 4: no owner or managed-by label. Control 5: the state is a local file with no remote backend or locking, so there is no shared audit trail.
8. What I changed before applying the output: I read the plan before applying it. I am adding a managed-by label for control 4. I am recording controls 1 and 5 as known limitations in the README because fixing them needs a real cluster account and a remote state store.