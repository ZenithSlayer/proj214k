# ADR 0001: Keep the backend a modular monolith

- Status: Superseded by ADR 0004
- Date: 2026-10-31

## Context

At the time of this decision, the project had one Expo client and a small Express API covering accounts, catalog, shopping, and orders. There was no demonstrated need for independent service scaling or separate team ownership. Checkout needed consistent writes across order-related data.

## Historical decision

This ADR originally selected a single deployable Express modular monolith with MySQL as the source of truth and Redis only for cache and transient notifications. The current service split is documented in ADR 0004.

## Consequences

- This was simpler to deploy and allowed one database transaction across order data.
- The shared database coupled domain modules and prevented independent service ownership.
