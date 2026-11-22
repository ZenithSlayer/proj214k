# ADR 0004: Split the API into domain microservices

- Status: Accepted
- Date: 2026-11-07
- Supersedes: ADR 0001

## Context

The application needs separately deployable APIs for user accounts, products, cart, and orders, orchestrated together with Docker Compose. The previous Express API shared one process and database across all domains.

## Decision

Deploy Users, Catalog, Cart, and Orders as separate Express containers. Products and categories remain together in Catalog. Give each service a dedicated MySQL container, schema, and persistent volume. Route the existing public paths through Nginx so the Expo client does not need service-specific URLs. Keep Redis and product-image storage owned by Catalog.

Services communicate through bounded-time HTTP calls. JWTs are forwarded when a downstream call must act on behalf of the same customer. A shared service-to-service secret protects internal account-data cleanup endpoints. Databases are private to the Compose network and have no cross-service foreign keys.

## Consequences

- Services can be built, restarted, and scaled independently; each database has independent availability and backup/restore requirements.
- Checkout uses the Orders database transaction for orders and line items, but user, cart, and catalog reads are remote calls and cannot participate in that transaction.
- Account deletion performs cart and order cleanup before deleting user data; a downstream failure blocks deletion and requires retry.
- All services share JWT verification and service-token secrets; rotating either requires coordinated rollout.
- Existing monolithic database data is not automatically migrated. Existing deployments need an explicit export/import plan before switching Compose volumes.
- Cross-service HTTP failures and increased operational resources are the cost of stronger service/data boundaries.
