# Project management and Jira-ready backlog

## Approach and Cynefin classification

Classify the current project as **Complicated** in Cynefin: the product workflows and primary data model are understood, and implementation can be planned with expert analysis. Integration behavior, production load, and payment-provider needs are less certain; use short discovery spikes before committing to those decisions. Reclassify a work item if experimentation reveals genuinely novel behavior.

Use **Scrum with a hybrid release gate**: two-week sprints and an ordered backlog for delivery; a predictive release checklist, deployment approval, backup, smoke test, and rollback plan for production. This combines feedback-driven development with explicit operational controls.

## Roles and responsibilities

| Role | Responsibility |
|---|---|
| Product Owner | Own value, priorities, acceptance criteria, and release decisions. |
| Scrum Master / Project Manager | Facilitate planning/review/retrospective, remove blockers, maintain workflow and progress visibility. |
| Analyst / Domain representative | Refine workflows, definitions, data/privacy constraints, and acceptance examples. |
| Developers | Estimate and implement stories, tests, documentation, and code review. |
| QA / Tester | Verify acceptance criteria, regression scenarios, and release smoke tests. |
| Operations / Release owner | Manage environment secrets, deployment, backup/restore, health checks, and incidents. |

Assign named people in Jira; roles above are role placeholders, not actual assignments.

## PM Canvas snapshot

| Canvas element | Project definition |
|---|---|
| Why | Make a maintainable multi-platform shopping experience with transparent, reliable catalog and checkout flows. |
| What | Expo application, Express API, relational commerce data, cache/event demonstration, deployment and operational documentation. |
| Who | Customers, store administrators, product owner, delivery team, QA, operations. |
| How | Four domain microservices with DDD-aligned boundaries, Scrum delivery, CI checks, and reviewed releases. |
| When | Two-week sprint cadence; release only after the release criteria pass. |
| Cost / resources | Team capacity, database/Redis hosting, CI runner, observability and backup storage; estimate after team sizing. |
| Risks | Payment data handling, checkout consistency, single-node outage, missing external integrations, Jira/hosting access. |
| Assumptions | MySQL is authoritative; payment/shipping providers are outside current scope; production secrets and host are provisioned by operations. |
| Success | Acceptance criteria pass, release smoke test is green, and initial availability/latency/error SLIs can be measured. |

## Predictive lifecycle mapping

Even with Scrum, maintain the five lifecycle views for governance:

1. **Initiation:** confirm problem, stakeholders, scope, constraints, and Complicated Cynefin classification.
2. **Planning:** prioritize stories, estimate team capacity, define acceptance/release criteria, risks, and deployment responsibilities.
3. **Execution:** deliver in two-week sprints, review code, test, and demonstrate increments.
4. **Monitoring and control:** inspect Jira flow, sprint goal, defects, risk/impediments, CI results, and operational indicators.
5. **Closure:** obtain acceptance, tag release, verify handover/runbook/backups, close Jira work, and capture lessons learned.

## Scrum backlog and Jira workflow

The CSV [jira-backlog.csv](./jira-backlog.csv) is an import-ready starter backlog with epics, prioritized stories/tasks, and acceptance criteria. Import it into the team's Jira project, map **Issue Type**, **Summary**, **Description**, **Priority**, **Labels**, **Epic Name**, **Epic Link**, **Status**, and **Assignee**, then assign real Jira users. No Jira workspace credentials or Jira API integration are available in this repository, so no remote Jira issues, assignments, or status transitions are represented as completed.

Recommended workflow: **Backlog → Selected for Development → In Progress → Code Review → QA → Done**. Add **Blocked** as a visible status with a required blocker reason; return failed QA/code review items to **In Progress**. The Scrum Master monitors blocked age and work-in-progress; the Product Owner owns priority and acceptance.

Definition of Ready: user value and scope are clear, acceptance criteria are testable, dependencies are linked, and the team can estimate the item. Definition of Done: acceptance criteria pass, tests and review pass, documentation/API contract are updated, and the item is deployable behind the agreed release gate.

## Versioning and release controls

Use semantic version tags `vMAJOR.MINOR.PATCH`. A release candidate must pass frontend lint, TypeScript checks, backend automated tests, API image build, Compose configuration validation, API contract review, and smoke tests. CI enforces frontend lint, web export, backend tests, and API image/Compose validation. Breaking API/schema changes require a major version or a documented migration/compatibility window. Keep production deploy manual until the deployment host, secrets, monitoring, and rollback procedure are approved.
