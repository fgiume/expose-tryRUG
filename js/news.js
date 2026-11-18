/* EXPOSE news: posts are edited in data/news.json by repository collaborators.
 * This page never accepts anonymous publishing or loads third-party news feeds.
 */
(function () {
  "use strict";
  var list = document.getElementById("news-list");
  var status = document.getElementById("news-status");
  if (!list || !status) return;
  function node(tag, value, className) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (value !== undefined) e.textContent = value;
    return e;
  }
  function safeUrl(raw) {
    if (typeof raw !== "string") return "";
    try {
      var u = new URL(raw, location.href);
      // Permit external HTTPS and internal links; block dangerous schemes.
      return (u.protocol === "https:" || (u.protocol === "http:" && u.origin === location.origin)) ? u.href : "";
    } catch (err) { return ""; }
  }
  function renderPost(p) {
    if (!p || typeof p.title !== "string" || !p.title.trim()) return;
    var date = typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : "";
    var a = node("article", undefined, "news-post");
    if (p.id && /^[a-z0-9-]+$/.test(p.id)) a.id = p.id;
    var meta = node("div", undefined, "news-meta");
    if (date) {
      var t = node("time", new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {year:"numeric",month:"long",day:"numeric"}));
      t.dateTime = date;
      meta.appendChild(t);
    }
    if (typeof p.category === "string" && p.category.trim()) meta.appendChild(node("span",p.category,"news-category"));
    a.appendChild(meta);
    a.appendChild(node("h2",p.title));
    if (typeof p.summary === "string" && p.summary.trim()) a.appendChild(node("p",p.summary,"news-summary"));
    if (Array.isArray(p.body)) p.body.forEach(function(paragraph) {
      if (typeof paragraph === "string" && paragraph.trim()) a.appendChild(node("p",paragraph));
    });
    if (p.link && safeUrl(p.link)) {
      var link = node("a",p.linkLabel || "Read more","news-link");
      link.href = safeUrl(p.link);
      if (new URL(link.href).origin !== location.origin) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      a.appendChild(link);
    }
    list.appendChild(a);
  }
  fetch("data/news.json", {cache:"no-store"}).then(function(response) {
    if (!response.ok) throw new Error("Failed to load news");
    return response.json();
  }).then(function(data) {
    var posts = Array.isArray(data.posts) ? data.posts.filter(function(p){return p && p.published !== false;}) : [];
    posts.sort(function(a,b){return String(b.date || "").localeCompare(String(a.date || ""));});
    status.textContent = posts.length ? posts.length + (posts.length === 1 ? " update" : " updates") : "No news has been published yet.";
    posts.forEach(renderPost);
    if (!posts.length) list.appendChild(node("p","EXPOSE updates, announcements and project news will appear here when the team publishes them.","news-empty"));
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }).catch(function() {
    status.textContent = "News is temporarily unavailable.";
    list.appendChild(node("p","Please check back later or contact expose@rug.nl.","news-empty"));
  });
})();
