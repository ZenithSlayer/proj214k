# ADR 0002: Use MySQL/MariaDB for transactional data

- Status: Accepted
- Date: 2026-10-31

## Context

Each bounded context stores relational data, with foreign keys limited to relationships owned by that context. Orders and order items need transactional consistency. The API uses MySQL-compatible SQL through `mysql2`.

## Decision

Keep MySQL as the authoritative relational store, with an independent MySQL database per service. Use local foreign keys and transactions for related writes. Cross-service identifiers are references managed through HTTP APIs, not cross-database foreign keys. Do not persist the catalog cache or Redis Pub/Sub events as business records.

## Alternatives considered

- PostgreSQL: technically suitable, but would require a migration without a current business or operational benefit.
- Document database: weakens the relational integrity needed for orders, customers, and product/category links.
- SQLite: suitable for isolated development, but not the intended multi-container deployment or concurrent writes.

## Consequences

- Existing schema and code remain compatible with MySQL; service-owned schemas are bootstrapped separately on fresh Compose volumes.
- Backups, restore drills, schema migrations, and least-privilege database credentials are required operational controls.
- Compose schema scripts run only when a database volume is first initialized. Existing monolithic database data is not automatically migrated into the new service databases.
