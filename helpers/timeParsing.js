const iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;

function ISO8601ToString(iso8601Duration) {
  var matches = iso8601Duration.match(iso8601DurationRegex);

  const days = matches[5];
  const hours = matches[6];
  const minutes = matches[7];

  let duration = "";
  if (days != null && Number(days) > 0) {
    duration += `${Number(days)} days `;
  }

  if (hours != null && Number(hours) > 0) {
    duration += `${Number(hours)} hours `;
  }

  if (minutes != null && Number(minutes) > 0) {
    duration += `${Number(minutes)} mins`;
  }

  return duration.trim();
}

module.exports = ISO8601ToString;
