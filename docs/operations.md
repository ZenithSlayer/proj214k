# Operations, SLOs, and incident runbook

## SLIs and SLOs

Targets are initial objectives, not measured production claims. Capture a baseline before treating them as commitments.

| SLI | Initial SLO | Measurement |
|---|---|---|
| API availability | 99.5% successful health checks per calendar month | `2xx` `/` responses / all health probes, excluding planned maintenance. |
| API latency | 95% of successful read requests under 500 ms per 30 days | Nginx/API request duration; segment catalog from account endpoints. |
| Catalog latency | 95% of warmed `GET /products` responses under 300 ms | Request duration and Redis cache hit/miss counters. |
| Error rate | Under 1% 5xx responses per rolling 30 minutes | API status-code logs divided by all API requests. |
| Recovery | Restore API service within 30 minutes; restore data from the latest verified backup | Incident timestamps and quarterly restore drill. |

No metrics exporter or alert manager is currently installed. Until one is selected, collect JSON request logs and container health/restart data; do not report the targets above as achieved.

## Resilience strategies

| Strategy | Applied behavior | Limitation |
|---|---|---|
| Cache-aside | Redis lookup, SQL on miss, TTL on cache write. | Redis is optional for correctness; SQL load rises during outage. |
| Cache invalidation | Increment shared catalog version after successful product/category writes. | Database write and Redis invalidation are not a distributed transaction; TTL bounds stale cache if Redis cannot be reached. |
| Timeout | Nginx connect timeout 5 s and upstream read timeout 30 s. | Database query timeout/pool sizing should be added before production scale. |
| Retry | MySQL connection reconnects after connection loss; Compose restarts failed containers. | Do not blindly retry checkout writes; idempotency is not implemented. |
| Circuit breaker | Not implemented. | Add only with a measured need; current Redis failures are logged and catalog falls back to SQL. |
| Messaging | HMAC-signed events on Redis Pub/Sub; consumer validates signatures. | Best-effort, at-most-once delivery; no durable queue or replay. |

## Observability plan

### Logs

- Emit one structured request record per response with request ID, method, route path, status, and duration; never log authorization headers or request bodies.
- Keep existing application records for startup, MySQL connection state, Redis errors, cache hit/miss, image validation failures, and signed event publish/consume.
- To demonstrate event circulation locally, run `docker compose logs -f catalog-api`, create/update a product through the API, and confirm matching `Published signed event ...` and `Consumed signed event ...` records with the same event ID.
- Add `requestId` to error logs when request-level error handling is introduced; redact secrets and personal/payment data.
- Retain container stdout/stderr centrally in production and define retention/access policies.

### Metrics to add to a production collector

- Request count and latency histogram by method/route/status; 4xx and 5xx rates.
- MySQL connection state, query duration, errors, and pool saturation.
- Redis availability, command latency, cache hit/miss/eviction rate, and Pub/Sub publish/consume/rejected-signature counts.
- Process memory/CPU/restarts, container health, upload errors/storage volume usage.
- Alert on sustained API 5xx, health-check failures, database disconnects, Redis failures that drive excess SQL load, and low disk space.

## Deployment and rollback

The initial deployment is a single Compose stack behind Nginx, not blue/green. Deploy from a reviewed main-branch revision after CI passes. Keep database and uploads on persistent volumes and take a verified database backup before schema changes. The workflow's production deploy is manual and requires the production GitHub environment and SSH secrets to be configured.

Keep the production `.env` file on the deployment host and out of version control. CI copies `.env.example` to a temporary `.env` only to validate the Compose configuration; the remote deploy uses the host's configured `.env`.

Rollback by redeploying the previous known-good revision with `docker compose up -d --build`; do not roll back a database migration unless its backward-compatibility and data recovery plan are known. Check health and perform the smoke tests in the release criteria after either deploy or rollback.

## Incident runbook: API crash or outage

1. **Triage:** Check the alert, incident start time, affected routes, and the latest deployment. Do not paste tokens, card data, or customer data into incident chat.
2. **Inspect:** From the deployment host, run `docker compose ps` and `docker compose logs --tail=200 nginx users-api catalog-api cart-api orders-api users-db catalog-db cart-db orders-db redis`. Confirm the gateway, each domain service, its owned database, and Redis health separately.
3. **Restore service:** Identify the unhealthy domain service (`users-api`, `catalog-api`, `cart-api`, or `orders-api`), restart only that service with `docker compose restart <service>`, and inspect its logs. If a new release caused the failure, redeploy the previous known-good revision.
4. **Check dependencies:** Confirm the matching database (`users-db`, `catalog-db`, `cart-db`, or `orders-db`) is accepting connections and has free disk; confirm Redis availability for Catalog. Catalog reads can fall back to its MySQL database during Redis failures, but watch database load. Do not delete Redis or database volumes as a recovery action.
5. **Validate:** Request `/health/ready` through Nginx, fetch `/products`, verify an authenticated route with a test account, and confirm `/uploads/` remains reachable for a known image.
6. **Escalate data risk:** If MySQL data is missing or corrupted, stop write traffic, preserve the volume, notify the data owner, and restore only from the latest verified backup using the documented restore procedure.
7. **Communicate and close:** Record impact, start/end time, actions, and evidence. Notify stakeholders when service is restored; create follow-up backlog items for root cause and prevention.
8. **Post-incident:** Within two working days, document root cause, contributing factors, SLO impact, and corrective actions. Never record secrets or full payment details.
