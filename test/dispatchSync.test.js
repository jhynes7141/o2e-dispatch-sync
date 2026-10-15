const { test } = require('node:test');
const assert = require('node:assert');
const { runDispatchSync, reconcile } = require('../src/dispatchSync');
const { getPosted } = require('../src/dispatchBoard');

// A cross-timezone multi-site order (one order, three sites in three regions),
// all scheduled for local 2026-10-14. Before the fix, the Chicago and NYC sites
// were dropped because the batch used the booking origin's (us-east) offset.
const orders = [
  { orderId: 'CW-99001', siteId: 'CW-SEA-01', region: 'us-west',    scheduledUtc: '2026-10-14T17:00:00Z', bookingOriginOffsetMinutes: -240 }, // 10:00 PT
  { orderId: 'CW-99001', siteId: 'CW-NYC-04', region: 'us-east',    scheduledUtc: '2026-10-14T13:00:00Z', bookingOriginOffsetMinutes: -240 }, // 09:00 ET
  { orderId: 'CW-99001', siteId: 'CW-CHI-02', region: 'us-central', scheduledUtc: '2026-10-15T02:00:00Z', bookingOriginOffsetMinutes: -240 }, // 21:00 CT on the 14th
];

test('all cross-timezone sites dispatch on their local run date', () => {
  const { dispatched, dropped } = runDispatchSync(orders, '2026-10-14');
  assert.deepStrictEqual(dispatched.sort(), ['CW-CHI-02', 'CW-NYC-04', 'CW-SEA-01']);
  assert.deepStrictEqual(dropped, []);
});

test('every confirmed site reaches a dispatch board', () => {
  const confirmed = orders.map((o) => o.siteId);
  const { dispatched } = runDispatchSync(orders, '2026-10-14');
  assert.deepStrictEqual(reconcile(confirmed, dispatched), []);
  assert.ok(getPosted().length >= 3);
});
