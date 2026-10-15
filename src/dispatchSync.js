// Nightly batch: push confirmed portal bookings to local franchise dispatch boards.
//
// A multi-site order has already been fanned out upstream into one dispatch
// record per site. Each record carries:
//   { orderId, siteId, region, scheduledUtc, bookingOriginOffsetMinutes }
//
// The batch keeps only records whose LOCAL scheduled date equals the run date,
// then posts each kept record to its local dispatch board.

const { postToDispatchBoard } = require('./dispatchBoard');

// Convert a UTC instant to a YYYY-MM-DD local date string, given an offset in minutes.
function localDateString(scheduledUtc, offsetMinutes) {
  const local = new Date(new Date(scheduledUtc).getTime() + offsetMinutes * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function runDispatchSync(dispatchRecords, runDate) {
  const dispatched = [];
  const dropped = [];

  for (const rec of dispatchRecords) {
    // BUG: normalizes every site using the booking ORIGIN's offset, not the
    // site's own franchise-local time zone. For multi-site orders that span
    // regions, sites in a different offset get a wrong local date and fall
    // outside the run-date window below.
    const scheduledLocalDate = localDateString(rec.scheduledUtc, rec.bookingOriginOffsetMinutes);

    if (scheduledLocalDate === runDate) {
      postToDispatchBoard(rec);
      dispatched.push(rec.siteId);
    } else {
      // Silently excluded from this batch -> never reaches the local board.
      dropped.push(rec.siteId);
    }
  }

  return { dispatched, dropped };
}

module.exports = { runDispatchSync, localDateString };
