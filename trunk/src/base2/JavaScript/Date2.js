
// http://developer.mozilla.org/es4/proposals/date_and_time.html

// big, ugly, regular expression
var _DATE_PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;  
var _DATE_PARTS = { // indexes to the sub-expressions of the RegExp above
  FullYear: 2,
  Month: 4,
  Date: 6,
  Hours: 8,
  Minutes: 10,
  Seconds: 12,
  Milliseconds: 14
};
var _TIMEZONE_PARTS = { // idem, but without the getter/setter usage on Date object
  Hectomicroseconds: 15, // :-P
  UTC: 16,
  Sign: 17,
  Hours: 18,
  Minutes: 20
};

var _TRIM_ZEROES   = /(((00)?:0+)?:0+)?\.0+$/;
var _TRIM_TIMEZONE = /(T[0-9:.]+)$/;

var Date2 = _createObject2(
  Date, 
  function(yy, mm, dd, h, m, s, ms) {
    switch (arguments.length) {
      case 0: return new Date;
      case 1: return typeof yy == "number" ? new Date(yy) : Date2.parse(yy);
      default: return new Date(yy, mm, arguments.length == 2 ? 1 : dd, h || 0, m || 0, s || 0, ms || 0);
    }
  }, "", {
    toISOString: function(date) {
      var string = "####-##-##T##:##:##.###";
      for (var part in _DATE_PARTS) {
        string = string.replace(/#+/, function(digits) {
          var value = date["getUTC" + part]();
          if (part == "Month") value++; // js month starts at zero
          return ("000" + value).slice(-digits.length); // pad
        });
      }
      // remove trailing zeroes, and remove UTC timezone, when time's absent
      return string.replace(_TRIM_ZEROES, "").replace(_TRIM_TIMEZONE, "$1Z");
    }
  }
);

delete Date2.forEach;

Date2.now = function() {
  return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
  if (arguments.length > 1) {
    assertType(defaultDate, "number", "default date should be of type 'number'.")
  }
  // parse ISO date
  var parts = match(string, _DATE_PATTERN);
  if (parts.length) {
    if (parts[_DATE_PARTS.Month]) parts[_DATE_PARTS.Month]--; // js months start at zero
    // round milliseconds on 3 digits
    if (parts[_TIMEZONE_PARTS.Hectomicroseconds] >= 5) parts[_DATE_PARTS.Milliseconds]++;
    var date = new Date(defaultDate || 0);
    var prefix = parts[_TIMEZONE_PARTS.UTC] || parts[_TIMEZONE_PARTS.Hours] ? "UTC" : "";
    for (var part in _DATE_PARTS) {
      var value = parts[_DATE_PARTS[part]];
      if (!value) continue; // empty value
      // set a date part
      date["set" + prefix + part](value);
      // make sure that this setting does not overflow
      if (date["get" + prefix + part]() != parts[_DATE_PARTS[part]]) {
        return NaN;
      }
    }
    // timezone can be set, without time being available
    // without a timezone, local timezone is respected
    if (parts[_TIMEZONE_PARTS.Hours]) {
      var hours = Number(parts[_TIMEZONE_PARTS.Sign] + parts[_TIMEZONE_PARTS.Hours]);
      var minutes = Number(parts[_TIMEZONE_PARTS.Sign] + (parts[_TIMEZONE_PARTS.Minutes] || 0));
      date.setUTCMinutes(date.getUTCMinutes() + (hours * 60) + minutes);
    } 
    return date.valueOf();
  } else {
    return Date.parse(string);
  }
};
