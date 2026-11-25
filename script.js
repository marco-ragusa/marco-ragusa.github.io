/* Theme toggle: follows the system until the visitor picks one */
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
  }

  function label() {
    toggle.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  toggle.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });

  if (media.addEventListener) media.addEventListener('change', label);
  label();
})();

/*
  Uptime strip + role durations.
  Single source of truth: the .role elements in index.html
  (data-start / data-end as YYYY-MM, no data-end = still there).
*/
(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var now = new Date();
  var nowIdx = now.getFullYear() * 12 + now.getMonth();

  function toIdx(ym) {
    var p = ym.split('-');
    return Number(p[0]) * 12 + (Number(p[1]) - 1);
  }
  function monthName(idx) {
    return MONTHS[idx % 12] + ' ' + Math.floor(idx / 12);
  }
  function duration(months) {
    var y = Math.floor(months / 12);
    var m = months % 12;
    var parts = [];
    if (y) parts.push(y + (y === 1 ? ' year' : ' years'));
    if (m) parts.push(m + (m === 1 ? ' month' : ' months'));
    return parts.join(', ');
  }

  var roles = Array.prototype.map.call(document.querySelectorAll('.role[data-start]'), function (el) {
    var start = toIdx(el.dataset.start);
    var end = el.dataset.end ? toIdx(el.dataset.end) : nowIdx;
    var title = el.querySelector('.role-title');
    return {
      el: el,
      id: el.id,
      company: el.dataset.company,
      title: title ? title.textContent.trim() : '',
      start: start,
      end: Math.max(start, end)
    };
  });
  if (!roles.length) return;

  // Role length next to the dates (inclusive of first and last month)
  roles.forEach(function (r) {
    var slot = r.el.querySelector('[data-role-length]');
    if (slot) slot.textContent = duration(r.end - r.start + 1);
  });

  var figure = document.querySelector('[data-uptime]');
  var strip = document.querySelector('[data-uptime-strip]');
  var tip = document.querySelector('[data-uptime-tip]');
  var total = document.querySelector('[data-uptime-total]');
  if (!figure || !strip) return;

  var first = Math.min.apply(null, roles.map(function (r) { return r.start; }));

  // For each month, the role that started most recently and was active then
  var months = [];
  for (var i = first; i <= nowIdx; i++) {
    var active = roles
      .filter(function (r) { return r.start <= i && i <= r.end; })
      .sort(function (a, b) { return b.start - a.start; })[0] || null;
    months.push({ idx: i, role: active });
  }

  if (total) total.textContent = duration(months.length);

  // Group consecutive months by employer
  var segments = [];
  months.forEach(function (m) {
    var company = m.role ? m.role.company : null;
    var last = segments[segments.length - 1];
    if (last && last.company === company) {
      last.months.push(m);
    } else {
      segments.push({ company: company, months: [m] });
    }
  });

  var barIndex = 0;
  segments.forEach(function (seg) {
    var firstM = seg.months[0];
    var lastM = seg.months[seg.months.length - 1];
    var target = lastM.role ? lastM.role.id : '';

    var a = document.createElement(target ? 'a' : 'div');
    a.className = 'seg';
    a.style.flex = seg.months.length + ' 1 0';
    // Show the real dates of the roles in this segment, not the trimmed bar range
    var segRoles = seg.months.map(function (m) { return m.role; }).filter(Boolean);
    var from = segRoles.length ? Math.min.apply(null, segRoles.map(function (r) { return r.start; })) : firstM.idx;
    var to = segRoles.length ? Math.max.apply(null, segRoles.map(function (r) { return r.end; })) : lastM.idx;
    var stillThere = segRoles.some(function (r) { return !r.el.dataset.end; });
    a.dataset.name = seg.company || 'No role';
    a.dataset.range = monthName(from) + ' – ' + (stillThere ? 'present' : monthName(to));
    if (target) {
      a.href = '#' + target;
      a.setAttribute('aria-label', a.dataset.name + ', ' + a.dataset.range.replace('–', 'to') + '. Show role.');
    }

    var bars = document.createElement('span');
    bars.className = 'seg-bars';
    bars.setAttribute('aria-hidden', 'true');

    seg.months.forEach(function (m) {
      var b = document.createElement('span');
      b.className = 'bar';
      b.style.setProperty('--i', barIndex++);
      b.dataset.month = monthName(m.idx);
      b.dataset.role = m.role ? m.role.title + ', ' + m.role.company : 'No role';
      bars.appendChild(b);
    });

    var label = document.createElement('span');
    label.className = 'seg-label';
    label.setAttribute('aria-hidden', 'true');
    label.innerHTML = '<b></b><span></span>';
    label.querySelector('b').textContent = seg.company || '';
    label.querySelector('span').textContent = String(Math.floor(firstM.idx / 12));

    a.appendChild(bars);
    a.appendChild(label);
    strip.appendChild(a);
  });

  // Play the fill-in sequence once
  requestAnimationFrame(function () { figure.classList.add('is-ready'); });

  // Tooltip: month + role under the pointer, or the whole employer on keyboard focus
  if (!tip) return;
  var hot = null;

  function place(x) {
    var box = figure.getBoundingClientRect();
    var stripBox = strip.getBoundingClientRect();
    var w = tip.offsetWidth;
    var left = Math.min(Math.max(x - box.left - w / 2, 0), box.width - w);
    tip.style.left = left + 'px';
    tip.style.top = (stripBox.top - box.top - tip.offsetHeight - 10) + 'px';
  }
  function show(title, text, x) {
    tip.innerHTML = '<b></b><span></span>';
    tip.querySelector('b').textContent = title;
    tip.querySelector('span').textContent = text;
    tip.classList.add('is-on');
    place(x);
  }
  function hide() {
    tip.classList.remove('is-on');
    if (hot) { hot.classList.remove('is-hot'); hot = null; }
  }

  strip.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var bar = e.target.closest('.bar');
    if (!bar) { hide(); return; }
    if (hot !== bar) {
      if (hot) hot.classList.remove('is-hot');
      hot = bar;
      bar.classList.add('is-hot');
      show(bar.dataset.month, bar.dataset.role, e.clientX);
    } else {
      place(e.clientX);
    }
  });
  strip.addEventListener('pointerleave', hide);

  strip.addEventListener('focusin', function (e) {
    var seg = e.target.closest('.seg');
    if (!seg) return;
    var r = seg.getBoundingClientRect();
    show(seg.dataset.name, seg.dataset.range, r.left + r.width / 2);
  });
  strip.addEventListener('focusout', hide);
})();
