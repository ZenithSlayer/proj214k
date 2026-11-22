# Documentation

## System and operations

- [Architecture](./architecture.md): C4 Context and Container diagrams, service boundaries, context map, domain model, quality scenarios, and release criteria.
- [API guide](./api.md): human-readable endpoint reference, authentication, and behavior notes.
- [OpenAPI contract](./openapi.yaml): machine-readable API definition for tooling and contract validation.
- [Operations](./operations.md): SLO targets, resilience behavior, observability plan, deployment, rollback, and incident runbook.
- [Project management](./project-management.md): Cynefin classification, delivery approach, PM Canvas, lifecycle, Scrum workflow, and release criteria.
- [Product documentation](./documentacao-produto.md): product requirements and history.

## Architecture Decision Records

- [ADR 0001: Modular monolith (superseded)](./adr/0001-modular-monolith.md)
- [ADR 0002: MySQL](./adr/0002-mysql.md)
- [ADR 0003: Redis cache and signed events](./adr/0003-redis-cache-and-events.md)
- [ADR 0004: Domain microservices](./adr/0004-domain-microservices.md)

## Project-management import

- [Jira backlog CSV](./jira-backlog.csv): import data, not a narrative document or evidence of live Jira activity. The Markdown project-management guide describes its intended workflow and current limitations.

The Markdown files are the human-readable documentation. OpenAPI YAML and the Jira CSV remain in their standard machine-importable formats.
