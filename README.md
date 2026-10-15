# o2e-dispatch-sync

Syncs confirmed bookings from the 1-800-GOT-JUNK? **commercial customer portal** to local **franchise dispatch boards**.

A customer books a pickup in the portal. Multi-site orders fan out into **one dispatch record per site**. A nightly batch (`runDispatchSync`) selects the records scheduled for the run date and posts each to its local franchise dispatch board so crews can be scheduled.

## Service levels

Each site's SLA clock is measured in that **site's local time zone** (see the Commercial SLA & Response-Time Tiers doc). A confirmed booking that never reaches a local dispatch board is a **MISSED** pickup, not a late one.

## Modules

- `src/timezones.js` — franchise/region → IANA time-zone map.
- `src/dispatchSync.js` — the nightly batch job.
- `test/dispatchSync.test.js` — batch tests.

## Run

```
node -e "require('./src/dispatchSync').runDispatchSync(require('./sample/orders.json'), '2026-10-14')"
```
