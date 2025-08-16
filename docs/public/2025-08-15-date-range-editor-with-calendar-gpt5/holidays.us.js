// U.S. Holidays with observed-Monday shifting per requirement.
// Exports: HOLIDAY_RULES (id, name, type, rule), expandHolidays(year, enabledRuleIds)
(function(global){
  const WD = { SUN:0, MON:1, TUE:2, WED:3, THU:4, FRI:5, SAT:6 };

  function iso(y,m,d){ // month 1-12
    const dt = new Date(y, m-1, d);
    dt.setHours(0,0,0,0);
    return dt.toISOString().slice(0,10);
  }
  function observedMonday(date){ // date: Date
    const d = new Date(date);
    const day = d.getDay();
    if (day === WD.SUN) { d.setDate(d.getDate() + 1); }
    else if (day === WD.SAT) { d.setDate(d.getDate() + 2); }
    d.setHours(0,0,0,0);
    return d;
  }
  function nthWeekdayOfMonth(year, monthIndex0, weekday, n){
    // monthIndex0: 0-11
    const first = new Date(year, monthIndex0, 1);
    const offset = (7 + weekday - first.getDay()) % 7;
    const day = 1 + offset + (n-1)*7;
    return new Date(year, monthIndex0, day);
  }
  function lastWeekdayOfMonth(year, monthIndex0, weekday){
    const last = new Date(year, monthIndex0 + 1, 0); // last day
    const offset = (7 + last.getDay() - weekday) % 7;
    const day = last.getDate() - offset;
    return new Date(year, monthIndex0, day);
  }

  const HOLIDAY_RULES = [
    { id: "newyears",    name: "New Year's Day",       type: "fixed", month: 1,  day: 1 },
    { id: "mlk",         name: "Martin Luther King Jr. Day", type: "nth",  month: 1,  weekday: WD.MON, n: 3 },
    { id: "presidents",  name: "Presidents' Day",      type: "nth",  month: 2,  weekday: WD.MON, n: 3 },
    { id: "memorial",    name: "Memorial Day",         type: "last", month: 5,  weekday: WD.MON },
    { id: "juneteenth",  name: "Juneteenth National Independence Day", type: "fixed", month: 6,  day: 19 },
    { id: "independence",name: "Independence Day",     type: "fixed", month: 7,  day: 4 },
    { id: "labor",       name: "Labor Day",            type: "nth",  month: 9,  weekday: WD.MON, n: 1 },
    { id: "columbus",    name: "Columbus Day",         type: "nth",  month: 10, weekday: WD.MON, n: 2 },
    { id: "veterans",    name: "Veterans Day",         type: "fixed", month: 11, day: 11 },
    { id: "thanksgiving",name: "Thanksgiving Day",     type: "nth",  month: 11, weekday: WD.THU, n: 4 },
    { id: "christmas",   name: "Christmas Day",        type: "fixed", month: 12, day: 25 },
  ];

  const DEFAULT_ENABLED = new Set(HOLIDAY_RULES.map(r => r.id));

  function expandForYear(year, enabledIds = DEFAULT_ENABLED){
    const items = [];
    for (const rule of HOLIDAY_RULES){
      let base;
      if (rule.type === "fixed"){
        base = new Date(year, rule.month - 1, rule.day);
      } else if (rule.type === "nth"){
        base = nthWeekdayOfMonth(year, rule.month - 1, rule.weekday, rule.n);
      } else if (rule.type === "last"){
        base = lastWeekdayOfMonth(year, rule.month - 1, rule.weekday);
      }
      base.setHours(0,0,0,0);
      const observed = observedMonday(base);
      items.push({
        id: `${rule.id}-${year}`,
        ruleId: rule.id,
        name: rule.name,
        year,
        date: iso(base.getFullYear(), base.getMonth()+1, base.getDate()),
        observedDate: observed.toISOString().slice(0,10),
        enabled: enabledIds.has(rule.id)
      });
    }
    return items;
  }

  function expandHolidays(years, enabledIds){
    // years: iterable of integer years to expand
    const map = new Map(); // key=observedDate, value=[names]
    const list = [];
    for (const y of years){
      const arr = expandForYear(y, enabledIds);
      for (const h of arr){
        list.push(h);
        const key = h.observedDate;
        if (!map.has(key)) map.set(key, []);
        if (h.enabled) map.get(key).push(h.name);
      }
    }
    return { list, observedMap: map };
  }

  // export into global
  global.US_HOLIDAYS = {
    HOLIDAY_RULES,
    DEFAULT_ENABLED,
    expandHolidays,
    observedMonday, // exported for testing parity with spec
  };
})(window);

