/* EXPOSE – shared behaviour: menu, reveal, counters, footer year, home-page interactives */
(function () {
  "use strict";
  var data = window.EXPOSE_DATA;

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  } else { reveals.forEach(function (r) { r.classList.add("in"); }); }

  /* ---------- counters ---------- */
  function countUp(el, target) {
    var start = null, dur = 1200;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (data) {
    var reports = {};
    data.cases.forEach(function (c) { reports[c.report] = 1; });
    var values = {
      cases: data.cases.length,
      regimes: data.regimes.length,
      categories: data.categories.length,
      reports: Object.keys(reports).length
    };
    var counters = document.querySelectorAll("[data-count]");
    var cio = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target, values[en.target.dataset.count] || 0); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 }) : null;
    counters.forEach(function (c) {
      if (cio) cio.observe(c); else c.textContent = values[c.dataset.count] || 0;
    });
  }

  /* ---------- home: evasion stepper ---------- */
  var tabs = document.querySelectorAll(".stepper .tab");
  var panel = document.getElementById("step-panel");
  var bar = document.getElementById("step-bar");
  var steps = [
    { t: "1. Load", h: "A legitimate-looking start", p: "A vessel loads cargo at a port under a clean-looking flag and paperwork. The documents name a front company, so nothing on paper points to a sanctioned buyer or seller." },
    { t: "2. Go dark", h: "Switching off or spoofing AIS", p: "Near the transfer area the Automatic Identification System is turned off, or a false position is broadcast. Panels of Experts have also documented cheaper Class B transponders on small feeder vessels." },
    { t: "3. Transfer", h: "Meeting at sea", p: "Cargo is pumped or loaded between ships far from port inspectors. Moving petroleum or coal in several small transfers makes each one harder to spot and to attribute." },
    { t: "4. Launder", h: "Paperwork and payment", p: "Vessel names and identities can be changed or stolen, and invoices, insurance and payments run through intermediaries. Banks and insurers can end up facilitating the trade without knowing." }
  ];
  function showStep(i) {
    if (!panel) return;
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); });
    panel.innerHTML = "<h3></h3><p></p>";
    panel.querySelector("h3").textContent = steps[i].h;
    panel.querySelector("p").textContent = steps[i].p;
    if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
  }
  tabs.forEach(function (t, i) { t.addEventListener("click", function () { showStep(i); }); });
  if (tabs.length) showStep(0);

  /* ---------- home: cards linked to the actual codebook variables ---------- */
  var grid = document.getElementById("cat-grid");
  if (grid) {
    var featured = [
      { label: "Luxury goods", type: "Sanction", color: "#2a9d8f", description: "Prohibited trade in luxury goods.", filter: "variable=V11" },
      { label: "Arms exports embargo", type: "Sanction", color: "#c1121f", description: "Restrictions on arms exports.", filter: "variable=V6" },
      { label: "Individual travel ban", type: "Sanction", color: "#1f8fd6", description: "Travel restrictions on designated individuals.", filter: "variable=V57" },
      { label: "Deceiving", type: "Strategy", color: "#e4572e", description: "Misrepresenting a shipment's contents or intended use.", filter: "strategy=Deceiving" },
      { label: "Obfuscating", type: "Strategy", color: "#8a5cf6", description: "Concealing the parties, origins or destinations involved.", filter: "strategy=Obfuscating" },
      { label: "False documentation", type: "Tactic", color: "#d35d9c", description: "Using falsified or altered documents to evade restrictions.", filter: "tactic=False%20Documentation" },
      { label: "AIS manipulation", type: "Tactic", color: "#e0a100", description: "Falsifying vessel tracking information.", filter: "tactic=AIS%20Manipulation" },
      { label: "Use of family members", type: "Tactic", color: "#6c757d", description: "Using relatives to conceal sanctioned individuals' involvement.", filter: "tactic=Use%20of%20Family%20Members" }
    ];
    featured.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "cat-card reveal in";
      a.style.setProperty("--c", item.color);
      a.href = "database.html?" + item.filter;
      a.innerHTML = "<span class='eyebrow'></span><h3></h3><p></p><span class='count'>Explore coded examples</span><span class='arrow' aria-hidden='true'>&rarr;</span>";
      a.querySelector(".eyebrow").textContent = item.type;
      a.querySelector("h3").textContent = item.label;
      a.querySelector("p").textContent = item.description;
      grid.appendChild(a);
    });
  }

  /* ---------- home: case spotlight ---------- */
  var spot = document.getElementById("spotlight-body");
  var btn = document.getElementById("spot-next");
  if (spot && data) {
    var images = { maritime: "assets/img/tanker-sts.svg", cyber: "assets/img/cyber-wallets.svg", arms: "assets/img/dhow.svg", commodity: "assets/img/tanker-sts.svg", front: "assets/img/report-stack.svg", financial: "assets/img/cyber-wallets.svg", complicity: "assets/img/report-stack.svg", procurement: "assets/img/report-stack.svg" };
    var last = -1;
    var render = function () {
      var i;
      do { i = Math.floor(Math.random() * data.cases.length); } while (i === last && data.cases.length > 1);
      last = i;
      var c = data.cases[i];
      var reg = data.regimes.filter(function (r) { return r.id === c.regime; })[0];
      document.getElementById("spot-meta").innerHTML = "";
      [reg.label, String(c.year)].forEach(function (t) {
        var s = document.createElement("span"); s.className = "badge light"; s.textContent = t; document.getElementById("spot-meta").appendChild(s);
      });
      document.getElementById("spot-title").textContent = c.title;
      document.getElementById("spot-text").textContent = c.summary;
      var link = document.getElementById("spot-link");
      link.href = "database.html?cat=" + encodeURIComponent(c.categories[0]) + "&regime=" + c.regime;
      var img = document.getElementById("spot-img");
      img.src = images[c.categories[0]] || images.maritime;
    };
    render();
    if (btn) btn.addEventListener("click", render);
  }
})();
