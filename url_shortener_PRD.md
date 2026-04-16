PRD: QuickLink — URL Shortener with Analytics
Project: QuickLink Version: 1.0 Target: Deployed, working software that a real user could use today Build constraint: One-shot autonomous build. No human intervention during build. Deploy at end.

What this is
QuickLink is a URL shortening service. Authenticated users can shorten long URLs into short links with optional custom slugs, see click analytics on their links, and manage their link collection. Public visitors to short links are redirected cleanly.
Why this exists
Url shorteners are a familiar primitive. The goal of this build is not novelty — it's to produce working, correct, production-ready software on a well-understood problem, so that the quality of execution can be measured against clear criteria.
The user
Primary: any authenticated user who wants to create short links, track their usage, and manage them. No assumption of technical sophistication.
Secondary: the anonymous public, who click short links and should be redirected reliably.

Functional requirements
Authentication
Users can create accounts via email + password (magic link acceptable alternative)
Users can sign in and sign out
Sessions persist across browser reloads
Users can only see and manage their own links
Password reset flow exists if using password auth
Short link creation
Authenticated user can submit a long URL and receive a short link
System validates that the long URL is a well-formed URL before accepting
Short link uses a generated slug by default (6-8 characters, alphanumeric)
User can optionally specify a custom slug
Custom slugs are validated for uniqueness and allowed characters (alphanumeric + hyphens only)
If requested custom slug is taken, user sees a clear error
Created link appears immediately in the user's link list
Short link redirection
Visiting /{slug} performs a 301 or 302 redirect to the long URL
Redirect happens without requiring authentication
Redirect is fast (under 200ms target)
Invalid slugs return a clean 404 page
Analytics
Every redirect is counted as a click
User can see total click count per link
User can see clicks over the last 7 days per link (daily totals acceptable; no need for hourly granularity)
Analytics page loads in under 2 seconds with reasonable data volumes
Link management
User can view all their links in a list
List shows: short link, destination URL, created date, total clicks
User can delete their own links
User cannot delete or modify links belonging to another user
Deleted links return 404 on redirect attempts
Rate limiting
Unauthenticated short link creation is blocked (auth required)
Authenticated users are rate-limited to some reasonable bound (e.g. 60 link creations per hour)
Rate limit exceeded returns a clear error, not a crash

Non-functional requirements
Security
No SQL injection vectors on any user-input endpoint
No exposed secrets in the repository (database credentials, API keys, session secrets)
Authentication tokens stored securely (httpOnly cookies or equivalent)
CSRF protection on state-changing operations
Users cannot access resources belonging to other users via URL manipulation
Reliability
Invalid inputs produce clear error messages, not crashes
Duplicate submissions do not create duplicate records
Network failures during link creation leave the system in a consistent state
The application does not log sensitive information (passwords, full session tokens)
Production readiness
README exists with setup instructions a stranger could follow
Environment variables are documented with example values
Database schema is reproducible from migration files
Application deploys successfully to Vercel
Deployed URL is publicly accessible and functional
Public GitHub repository exists with the code
Code quality
Application compiles without errors (tsc clean if TypeScript, equivalent for other stacks)
Some automated tests exist covering core functionality
File structure is comprehensible — no 1000-line monolithic files
Major concerns are separated (routing, auth logic, database access, UI)

Tech stack constraints
Framework: Next.js 14+ with App Router
Language: TypeScript
Database: Postgres (hosted — Supabase, Neon, or Vercel Postgres acceptable)
Auth: implementer's choice (Supabase Auth, NextAuth, Clerk, or hand-rolled — document the choice)
Deployment: Vercel
Repository: Public GitHub repository
Styling: implementer's choice, but must be responsive (mobile usable)

Deliverables
At completion, the following must exist:
Public GitHub repository with the full codebase
Deployed live URL on Vercel, publicly accessible
README with setup instructions
At least one test account that can be used for evaluation (credentials in README or an evaluation note)
All migrations applied; schema reproducible from repo
Any documentation the build process produced (architecture notes, decision logs, etc. — optional but if produced, included in repo)

Evaluation criteria
The deliverable will be evaluated on 30 criteria across five dimensions. Scoring: Met / Partial / Not Met per criterion. Evaluator should not have built either version.
Dimension 1 — Functional completeness (8 criteria)
Account creation succeeds with valid inputs
Sign-in succeeds with valid credentials
Sign-out works and invalidates session
Short link creation works with generated slug
Custom slug creation works when slug is available
Short link redirect resolves to correct destination
Click count increments on redirect
Link deletion removes the link; subsequent redirects return 404
Dimension 2 — Correctness under edge cases (7 criteria)
Invalid URL input rejected with clear error
Taken custom slug rejected with clear error
Attempting to access another user's link list returns empty or forbidden
Attempting to delete another user's link fails cleanly
Expired or invalid session redirects to sign-in
Empty submission on create form shows validation error
Rate limit triggers return a clear error, not a crash
Dimension 3 — Security (8 criteria)
No SQL injection on link creation endpoint (test with '; DROP TABLE style inputs)
No SQL injection on slug lookup
No secrets committed to the repository (scan .env.example, commit history, code)
Session tokens use httpOnly cookies or equivalent secure storage
User cannot access another user's analytics via URL manipulation
Password storage uses proper hashing if password auth chosen
No exposed admin or debug endpoints in production
CSRF protection present on state-changing operations
Dimension 4 — Production readiness (4 criteria)
README walks through setup; a developer following it can run locally
Environment variables documented with example values
Vercel deployment works; live URL is accessible
Database migrations apply cleanly from clean state
Dimension 5 — Code health (3 criteria)
tsc --noEmit passes without errors (or equivalent for non-TypeScript)
At least one automated test exists and passes
No single file exceeds 500 lines; concerns are separated into logical modules
Additional observational metrics (recorded, not scored)
Total time from brief to deployed URL
Total cost (tokens, API calls)
Number of commits during the build
Number of files created
Test coverage (if tests exist)
Bug count found during a 30-minute hands-on exploratory session by evaluator
Any additional features beyond the brief (noted as "exceeded scope")

Evaluation protocol
Evaluator receives: live URL, GitHub repo link, README, and any test account credentials
Evaluator runs through all 30 criteria, rating each
Evaluator conducts 30 minutes of exploratory testing, logging any bugs found
Evaluator records observational metrics
Evaluator writes one paragraph of qualitative notes per deliverable
Comparison writeup compiles both scores side-by-side
Evaluator should not be told which deliverable is HELM's and which is vanilla Claude's until after scoring is complete (to the extent the codebases don't reveal it, which they may).

Constraints on the build process
No human intervention during the build
No iteration after initial brief (one-shot)
Build ends when deployment is live or builder declares complete
If builder gets stuck, records the stuck point and ends the attempt there
Both environments use the same underlying model (Claude Sonnet 4.6 or Opus 4.6 — pick one, use for both)

Success definition for the experiment
This experiment does not have a pass/fail outcome for the project itself. It produces a signal on HELM's output quality relative to vanilla Claude on a well-scoped problem.
Possible findings:
HELM produces meaningfully more complete, correct, production-ready software than vanilla Claude on this brief → HELM has measurable output advantage to cite
HELM and vanilla Claude produce similar quality → HELM's value is operational (process, audit, verification) not raw output
HELM produces lower-quality software than vanilla Claude → HELM has execution gaps to close before external positioning
Any of these findings is useful. The goal is honest signal, not confirmation.

End of PRD.