# API guide

## Overview

The public API is served through the Nginx gateway. The local base URL is `http://localhost:8080`; set the production base URL to the deployed gateway origin. The [OpenAPI contract](./openapi.yaml) is the authoritative machine-readable definition, including request parameters and schemas.

Protected endpoints require `Authorization: Bearer <JWT>`. Product and category write endpoints require an authenticated administrator. Internal service-to-service endpoints are not part of the public API and must not be called by the client.

## Public endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/` | Public | Liveness response. |
| `GET` | `/health/ready` | Public | Users service and database readiness check; it does not represent readiness of every service. |
| `GET` | `/products` | Public | List active products. |
| `GET` | `/products/tag` | Public | List categories used by active products. |
| `GET` | `/products/tag/{id}` | Public | List active products in a category. |
| `GET` | `/products/{id}` | Public | Get an active product. |
| `GET` | `/categories` | Public | List active categories. |
| `POST` | `/users/register` | Public | Register an account. |
| `POST` | `/users/login` | Public | Authenticate with email or name and receive a JWT. |
| `GET` | `/users/me` | JWT | Get the authenticated user's profile and related data. |
| `PUT` | `/users/profile` | JWT | Update profile name and email. |
| `PUT` | `/users/password` | JWT | Change the authenticated user's password. |
| `POST` | `/users/address` | JWT | Add a shipping address. |
| `PUT` | `/users/address/{id}` | JWT | Update an address. |
| `DELETE` | `/users/address/{id}` | JWT | Delete an address. |
| `PUT` | `/users/address/{id}/favorite` | JWT | Set the favorite address. |
| `POST` | `/users/card` | JWT | Store payment-card metadata. This is not a payment-provider integration and is not suitable for real payment data. |
| `DELETE` | `/users/card/{id}` | JWT | Delete a payment-card record. |
| `PUT` | `/users/card/{id}/favorite` | JWT | Set the favorite payment-card record. |
| `DELETE` | `/users` | JWT | Delete the authenticated account and request cleanup from dependent services. |
| `GET` | `/cart` | JWT | Get the authenticated user's cart. |
| `POST` | `/cart` | JWT | Add a product to the cart. |
| `PUT` | `/cart/{id}` | JWT | Update a cart item's quantity. |
| `DELETE` | `/cart/{id}` | JWT | Remove a cart item. |
| `DELETE` | `/cart` | JWT | Clear the authenticated user's cart. |
| `GET` | `/orders` | JWT | Get the authenticated user's order history. |
| `POST` | `/orders` | JWT | Place an order. Totals are calculated from current catalog prices; no payment is processed and the order remains pending. |
| `GET` | `/orders/{id}` | JWT | Get order line items. |

## Administrator endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/products` | Create a product. |
| `PUT` | `/products/{id}` | Update a product. |
| `DELETE` | `/products/{id}` | Soft-delete a product. |
| `POST` | `/products/upload-image` | Upload and deduplicate a JPG, PNG, or WebP product image (maximum 10 MiB). |
| `POST` | `/categories` | Create a category. |

## Operational notes

- Catalog reads use Redis cache-aside with a TTL; MySQL remains authoritative. Product and category writes invalidate catalog cache versions.
- Redis Pub/Sub events are signed and verified, but delivery is best-effort and at-most-once.
- Checkout commits the order and line items in the Orders database before clearing the cart. A payment provider and checkout idempotency are not implemented.
- The readiness route checks the Users service and its database only. Use individual container health checks and the deployment smoke tests to verify the other services.
