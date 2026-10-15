// Nightly batch: push confirmed portal bookings to local franchise dispatch boards.
//
// A multi-site order has already been fanned out upstream into one dispatch
// record per site. Each record carries:
//   { orderId, siteId, region, scheduledUtc, bookingOriginOffsetMinutes }
//
// The batch keeps only records whose LOCAL scheduled date equals the run date,
// then posts each kept record to its local dispatch board.
//
// FIX (APP-4): the local date MUST be computed in each site's own franchise
// time zone, not the booking origin's offset. Otherwise multi-site orders that
// span regions have off-site records fall outside the run-date window and get
// silently dropped.

const { postToDispatchBoard } = require('./dispatchBoard');
const { tzForRegion } = require('./timezones');

// Convert a UTC instant to a YYYY-MM-DD date string in the given IANA time zone.
function localDateInZone(scheduledUtc, timeZone) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(scheduledUtc));
}

function runDispatchSync(dispatchRecords, runDate) {
  const dispatched = [];
  const dropped = [];

  for (const rec of dispatchRecords) {
    // Normalize to THIS site's franchise-local time zone before the window check.
    const timeZone = tzForRegion(rec.region);
    const scheduledLocalDate = localDateInZone(rec.scheduledUtc, timeZone);

    if (scheduledLocalDate === runDate) {
      postToDispatchBoard(rec);
      dispatched.push(rec.siteId);
    } else {
      dropped.push(rec.siteId);
    }
  }

  return { dispatched, dropped };
}

// Safety net: given the confirmed bookings and what the batch emitted, flag any
// confirmed booking that produced no dispatch record so it can be re-dispatched
// instead of silently missed.
function reconcile(confirmedSiteIds, dispatchedSiteIds) {
  const emitted = new Set(dispatchedSiteIds);
  return confirmedSiteIds.filter((siteId) => !emitted.has(siteId));
}

module.exports = { runDispatchSync, localDateInZone, reconcile };
