// Thin adapter to the local franchise dispatch board API.
// In the demo this just records what would have been posted.
const posted = [];

function postToDispatchBoard(record) {
  posted.push(record);
  return { ok: true, siteId: record.siteId };
}

function getPosted() {
  return posted.slice();
}

module.exports = { postToDispatchBoard, getPosted };
