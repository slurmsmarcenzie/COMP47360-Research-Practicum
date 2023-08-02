/** Enumeration of Location information */
const LOCATIONS = {
    LocNumMin:35,
    LocNumExpected:67,
    LocKeys: ["236", "42", "166", "68", "163", "87", "152", "141", "229", "90", "113", "79", "140", "151", "107", "263", "43", "24", "233", "238", "237", "249", "186", "262", "74", "4", "45", "48", "142", "170", "137", "261", "246", "41", "239", "148", "243", "153", "231", "114", "211", "164", "144", "13", "161", "125", "50", "162", "234", "202", "224", "244", "158", "232", "88", "752", "127", "143", "116", "100", "209", "120", "230", "12", "194", "128", "105"]
}
  
/** Enumeration of Time information */
const TIMES = {
    HourNumMin:15,
    HourNumExpected:24
}
  
  /** Enumeration of the valid Busyness Score range */
const RANGE= {
    // expected range is -1 to +1. However 2 is better to tolerate conversion changes
    min:-2,
    max:2
}

module.exports = {LOCATIONS, TIMES, RANGE}

