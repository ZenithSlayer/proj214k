# ADR 0003: Use Redis for catalog cache and signed transient events

- Status: Accepted
- Date: 2026-10-31

## Context

Public catalog reads are frequent and product writes are comparatively infrequent. The API also needs a lightweight event circulation demonstration without introducing a second application service.

## Decision

Use Redis cache-aside for catalog list, category, tag, and product-detail responses with a configurable TTL (60 seconds by default). Product/category writes increment a shared catalog version, so older cache keys become unreachable immediately and expire by TTL. Publish product/category lifecycle events over Redis Pub/Sub; sign each envelope with HMAC-SHA-256 and reject invalid signatures in the consumer.

MySQL remains authoritative. Cache read/write/invalidation failures are logged and catalog reads fall back to SQL. Pub/Sub is at-most-once and is not used for durable business processing.

## Consequences

- Cache invalidation works across API instances using a shared version key.
- Cache entries expire automatically; a deployment does not require key scans.
- Pub/Sub logs demonstrate circulation but do not guarantee delivery to offline consumers.
- Configure a strong `EVENT_SIGNING_SECRET` shared by publishers and consumers; rotate it deliberately.
- Do not put credentials, card data, or personal data in event payloads.
