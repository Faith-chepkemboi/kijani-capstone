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