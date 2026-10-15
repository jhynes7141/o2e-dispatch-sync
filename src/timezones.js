// Franchise/region -> IANA time zone map.
// Each franchise dispatch board operates in its local time zone.
const REGION_TZ = {
  'us-west': 'America/Los_Angeles',
  'us-mountain': 'America/Denver',
  'us-central': 'America/Chicago',
  'us-east': 'America/New_York',
  'ca-west': 'America/Vancouver',
  'ca-central': 'America/Toronto',
  'ca-east': 'America/Halifax',
};

function tzForRegion(region) {
  const tz = REGION_TZ[region];
  if (!tz) throw new Error(`No time zone mapped for region: ${region}`);
  return tz;
}

module.exports = { REGION_TZ, tzForRegion };
