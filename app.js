/* =========================================================
   RoadTrip 2026 — App logic
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Hero photo (try a few filenames) ---------- */
  (function loadHeroPhoto() {
    const heroPhoto = document.getElementById("heroPhoto");
    const candidates = [
      "images/family.jpg",
      "images/family.jpeg",
      "images/family.png",
      "images/family.JPG",
    ];
    let i = 0;
    function tryNext() {
      if (i >= candidates.length) return; // keep gradient fallback
      const probe = new Image();
      const src = candidates[i++];
      probe.onload = () => {
        heroPhoto.style.backgroundImage = `url("${src}")`;
      };
      probe.onerror = tryNext;
      probe.src = src + "?v=" + Date.now(); // avoid stale cache
    }
    tryNext();
  })();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav-links");
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });

  /* ---------- Countdown ---------- */
  const target = new Date(TRIP.start).getTime();
  const els = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMins"),
    s: document.getElementById("cdSecs"),
  };
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = "0";
      document.querySelector(".hero-kicker").textContent = "The adventure is on! 🎉";
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    els.d.textContent = d;
    els.h.textContent = String(h).padStart(2, "0");
    els.m.textContent = String(m).padStart(2, "0");
    els.s.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Stats ---------- */
  document.getElementById("statStops").textContent = TRIP.stops.length;

  /* ---------- Timeline ---------- */
  const todayStr = localISODate(new Date());
  const tl = document.getElementById("timeline");
  let todayIdx = -1;
  TRIP.days.forEach((day, idx) => {
    const range = (TRIP.dayRanges && TRIP.dayRanges[idx]) || null;
    const isToday = range && todayStr >= range[0] && todayStr <= range[1];
    if (isToday && todayIdx === -1) todayIdx = idx;
    const item = document.createElement("div");
    item.className = "tl-item" + (isToday ? " today" : "");
    const dot = iconForTag(day.tag);
    item.innerHTML = `
      <div class="tl-dot">${dot}</div>
      <div class="tl-card">
        <span class="tl-date">${day.date}${isToday ? '<span class="tl-now">Today</span>' : ""}</span>
        <h3>${day.title}</h3>
        ${day.drive ? `<div class="tl-drive">🚗 ${day.drive}</div>` : ""}
        <ul>${day.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        <span class="tl-tag tag-${day.tag}">${day.tag}</span>
      </div>`;
    tl.appendChild(item);
  });
  function iconForTag(tag) {
    return { drive: "🚗", explore: "🗺️", fun: "🎉", cruise: "🛳️", stay: "🛏️" }[tag] || "📍";
  }

  /* ---------- "Today" banner in hero ---------- */
  (function renderTodayBanner() {
    const banner = document.getElementById("todayBanner");
    if (!banner) return;
    const tripStart = "2026-06-23";
    const tripEnd = "2026-07-18";
    if (todayStr < tripStart) {
      banner.innerHTML = `🧭 First stop: <b>${TRIP.days[0].title}</b>`;
      banner.hidden = false;
    } else if (todayStr > tripEnd) {
      banner.innerHTML = `🏁 What a trip! <b>Welcome home.</b>`;
      banner.hidden = false;
    } else if (todayIdx >= 0) {
      banner.innerHTML = `📍 Today: <b>${TRIP.days[todayIdx].title}</b>`;
      banner.hidden = false;
    }
  })();

  function localISODate(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  /* ---------- Map (OpenStreetMap + Leaflet) ---------- */
  function initMap() {
    const mapEl = document.getElementById("tripMap");
    if (!mapEl || typeof L === "undefined") return;

    const map = L.map(mapEl, { scrollWheelZoom: false }).setView([34, -78], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    TRIP.stops.forEach((stop, idx) => {
      const pos = [stop.coords[0], stop.coords[1]];
      bounds.extend(pos);

      const icon = L.divIcon({
        className: "num-pin",
        html: `<span>${idx + 1}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const osm =
        "https://www.openstreetmap.org/?mlat=" + stop.coords[0] +
        "&mlon=" + stop.coords[1] +
        "#map=13/" + stop.coords[0] + "/" + stop.coords[1];

      L.marker(pos, { icon: icon, title: stop.name })
        .addTo(map)
        .bindPopup(
          `<div class="popup-title">${stop.icon} ${stop.name}</div>
           <div class="popup-sub">${stop.label} · ${stop.date}</div>
           <a class="popup-link" href="${osm}" target="_blank" rel="noopener">Open in OpenStreetMap &rarr;</a>`
        );
    });

    // Route: follow the real roads using the public OSRM routing service.
    // We route through the driving stops only (hotels / home / port),
    // not the in-city activity markers. The trip is split into two legs:
    //   GO  (south): Québec → ... → Miami (PortMiami)
    //   BACK (north): Miami → ... → Québec
    const GO_COLOR = "#ff6b5e";   // sunset coral — heading south
    const BACK_COLOR = "#1e88e5"; // ocean blue — heading home

    const driveStops = TRIP.stops.filter(
      (s) => s.type === "home" || s.type === "stay" || s.type === "cruise"
    );

    // Turnaround = the PortMiami embark point. Everything up to & including it
    // is the outbound leg; from the next Miami stop onward is the return leg.
    const turnIdx = driveStops.findIndex((s) => s.type === "cruise");
    const goStops = turnIdx > 0 ? driveStops.slice(0, turnIdx + 1) : driveStops;
    const backStops = turnIdx > 0 ? driveStops.slice(turnIdx + 1) : [];

    const driveSummaryEl = document.getElementById("driveSummary");
    function shorten(name) {
      return name
        .replace("Wyndham Garden Washington DC North", "Washington DC")
        .replace("Quality Inn Mount Pleasant", "Charleston")
        .replace("Club Wyndham Cypress Palms", "Orlando")
        .replace("PortMiami — Norwegian Escape", "Miami (Port)")
        .replace("Miami — Friends", "Miami")
        .replace("Savannah, GA", "Savannah")
        .replace("Philadelphia, PA", "Philadelphia")
        .replace("Québec City", "Québec");
    }
    function fmtDur(secs) {
      const h = Math.floor(secs / 3600);
      const m = Math.round((secs % 3600) / 60);
      return (h ? h + "h " : "") + m + "m";
    }
    function fmtDist(meters) {
      return Math.round(meters / 1000).toLocaleString() + " km";
    }
    function addDriveGroup(title, stops, legs, cssClass) {
      if (!driveSummaryEl || !legs || !legs.length) return;
      let totalM = 0;
      let totalS = 0;
      let rows = "";
      legs.forEach((leg, i) => {
        const a = stops[i];
        const b = stops[i + 1];
        totalM += leg.distance || 0;
        totalS += leg.duration || 0;
        const dir =
          "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=" +
          a.coords[0] + "," + a.coords[1] + ";" +
          b.coords[0] + "," + b.coords[1];
        rows +=
          `<div class="drive-row ${cssClass}">
             <span class="dr-route">${shorten(a.name)} → ${shorten(b.name)}</span>
             <span class="dr-meta">${fmtDur(leg.duration)} · ${fmtDist(leg.distance)}</span>
             <a href="${dir}" target="_blank" rel="noopener">Directions →</a>
           </div>`;
      });
      const km = Math.round(totalM / 1000);
      const hrs = Math.floor(totalS / 3600);
      const mins = Math.round((totalS % 3600) / 60);
      const group = document.createElement("div");
      group.className = "drive-leg-group";
      group.innerHTML =
        `<h3>${title}</h3>
         <div class="drive-rows">${rows}</div>
         <div class="drive-total">Total: ${hrs}h ${mins}m · ${km.toLocaleString()} km of driving</div>`;
      driveSummaryEl.appendChild(group);
    }

    function straightLine(stops, color, dashed) {
      if (stops.length < 2) return null;
      return L.polyline(
        stops.map((s) => [s.coords[0], s.coords[1]]),
        { color: color, weight: 4, opacity: 0.9, dashArray: dashed ? "2 12" : null }
      );
    }

    // Creates a toggleable leg (returns an object with setVisible()).
    // Uses OSRM for the real roads; falls back to straight lines if it fails.
    function createLeg(stops, color, dashed, summaryTitle, summaryClass) {
      const leg = { layer: L.layerGroup().addTo(map), visible: true };
      leg.setVisible = function (v) {
        leg.visible = v;
        if (v) leg.layer.addTo(map);
        else map.removeLayer(leg.layer);
      };
      if (stops.length < 2) return leg;

      const coordStr = stops.map((s) => s.coords[1] + "," + s.coords[0]).join(";");
      const url =
        "https://router.project-osrm.org/route/v1/driving/" + coordStr +
        "?overview=full&geometries=geojson&steps=false&annotations=false";

      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (data.code === "Ok" && data.routes && data.routes[0]) {
            const route = data.routes[0];
            const latlngs = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            L.polyline(latlngs, {
              color: color,
              weight: dashed ? 4 : 5,
              opacity: 0.9,
              dashArray: dashed ? "2 12" : null,
            }).addTo(leg.layer);
            addDriveGroup(summaryTitle, stops, route.legs, summaryClass);
          } else {
            throw new Error(data.code || "OSRM error");
          }
        })
        .catch((err) => {
          console.warn("OSRM routing failed (" + err.message + "). Using straight lines.");
          const sl = straightLine(stops, color, dashed);
          if (sl) sl.addTo(leg.layer);
        });
      return leg;
    }

    // GO solid coral, BACK dashed blue so both show where roads overlap.
    const goLeg = createLeg(goStops, GO_COLOR, false, "🌴 Drive South (go)", "");
    const backLeg = createLeg(backStops, BACK_COLOR, true, "🏡 Drive Home (back)", "back");

    // Wire the show/hide checkboxes.
    const goCb = document.getElementById("toggleGo");
    const backCb = document.getElementById("toggleBack");
    if (goCb) goCb.addEventListener("change", (e) => goLeg.setVisible(e.target.checked));
    if (backCb) backCb.addEventListener("change", (e) => backLeg.setVisible(e.target.checked));

    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
    setTimeout(() => map.invalidateSize(), 200);
  }

  // Leaflet is loaded before this script, so build the map right away.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }

  /* ---------- Stays ---------- */
  const stayGrid = document.getElementById("stayGrid");
  TRIP.stops
    .filter((s) => s.type === "stay" || s.type === "cruise")
    .forEach((s) => {
      const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name)}`;
      const card = document.createElement("div");
      card.className = "stay-card";
      card.innerHTML = `
        <div class="icon">${s.icon}</div>
        <h3>${s.name}</h3>
        <div class="when">${s.label}</div>
        <a href="${gmaps}" target="_blank" rel="noopener">📍 View on Google Maps</a>`;
      stayGrid.appendChild(card);
    });

  /* ---------- Calendar list ---------- */
  const calList = document.getElementById("calList");
  TRIP.events.forEach((ev) => {
    const row = document.createElement("div");
    row.className = "cal-row";
    row.innerHTML = `<div class="ct">${ev.title}</div><div class="cd">${fmtRange(ev)} · ${ev.loc}</div>`;
    calList.appendChild(row);
  });
  function fmtRange(ev) {
    const opt = { month: "short", day: "numeric" };
    const s = new Date(ev.start).toLocaleDateString("en-US", opt);
    return s;
  }

  /* ---------- Google Calendar quick link (first event) ---------- */
  const first = TRIP.events[0];
  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent("RoadTrip 2026: " + first.title) +
    "&dates=" + icsDate(first.start) + "/" + icsDate(first.end) +
    "&details=" + encodeURIComponent("Family RoadTrip 2026 — Québec to Miami and back!") +
    "&location=" + encodeURIComponent(first.loc);
  document.getElementById("gcalLink").href = gcal;

  /* ---------- ICS export ---------- */
  document.getElementById("downloadIcs").addEventListener("click", () => {
    let ics =
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//RoadTrip2026//EN\r\nCALSCALE:GREGORIAN\r\n";
    TRIP.events.forEach((ev, i) => {
      const allDay = ev.start.length === 10;
      ics += "BEGIN:VEVENT\r\n";
      ics += `UID:roadtrip2026-${i}@family\r\n`;
      ics += `DTSTAMP:${icsDate(new Date().toISOString())}\r\n`;
      if (allDay) {
        ics += `DTSTART;VALUE=DATE:${ev.start.replace(/-/g, "")}\r\n`;
        ics += `DTEND;VALUE=DATE:${ev.end.replace(/-/g, "")}\r\n`;
      } else {
        ics += `DTSTART:${icsDate(ev.start)}\r\n`;
        ics += `DTEND:${icsDate(ev.end)}\r\n`;
      }
      ics += `SUMMARY:${escapeIcs(ev.title)}\r\n`;
      ics += `LOCATION:${escapeIcs(ev.loc)}\r\n`;
      ics += "END:VEVENT\r\n";
    });
    ics += "END:VCALENDAR";

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RoadTrip2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  });

  function icsDate(str) {
    // Returns UTC-ish basic format YYYYMMDDTHHMMSSZ
    const d = new Date(str.length === 10 ? str + "T09:00:00" : str);
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function escapeIcs(s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }

  /* ---------- Packing checklist (saved in localStorage) ---------- */
  (function initPacking() {
    const grid = document.getElementById("packGrid");
    if (!grid || !TRIP.packing) return;
    const STORE = "roadtrip2026.packing";
    const saved = JSON.parse(localStorage.getItem(STORE) || "{}");
    const barFill = document.getElementById("packBarFill");
    const countEl = document.getElementById("packCount");
    const checkboxes = [];

    Object.keys(TRIP.packing).forEach((cat, ci) => {
      const card = document.createElement("div");
      card.className = "pack-cat";
      const items = TRIP.packing[cat]
        .map((item, ii) => {
          const id = "pk-" + ci + "-" + ii;
          const checked = saved[id] ? "checked" : "";
          return `<label><input type="checkbox" id="${id}" ${checked}/><span>${item}</span></label>`;
        })
        .join("");
      card.innerHTML = `<h3>${cat}</h3>${items}`;
      grid.appendChild(card);
    });

    grid.querySelectorAll("input[type=checkbox]").forEach((cb) => checkboxes.push(cb));

    function update() {
      const total = checkboxes.length;
      const done = checkboxes.filter((c) => c.checked).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      if (barFill) barFill.style.width = pct + "%";
      if (countEl) countEl.textContent = done + " / " + total + " packed (" + pct + "%)";
      const state = {};
      checkboxes.forEach((c) => { if (c.checked) state[c.id] = 1; });
      localStorage.setItem(STORE, JSON.stringify(state));
    }
    grid.addEventListener("change", update);
    const resetBtn = document.getElementById("packReset");
    if (resetBtn)
      resetBtn.addEventListener("click", () => {
        checkboxes.forEach((c) => (c.checked = false));
        update();
      });
    update();
  })();

  /* ---------- Memories gallery (photos stored in IndexedDB) ---------- */
  (function initMemories() {
    const grid = document.getElementById("memGrid");
    const input = document.getElementById("memInput");
    const select = document.getElementById("memStop");
    const emptyMsg = document.getElementById("memEmpty");
    if (!grid || !input || !select) return;

    // Populate the stop dropdown
    TRIP.stops.forEach((s, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = s.icon + " " + s.name;
      select.appendChild(opt);
    });

    let db = null;
    const DB_NAME = "roadtrip2026";
    const STORE = "photos";

    function openDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          if (!d.objectStoreNames.contains(STORE)) {
            d.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    function tx(mode) {
      return db.transaction(STORE, mode).objectStore(STORE);
    }
    function getAll() {
      return new Promise((resolve, reject) => {
        const out = [];
        const cur = tx("readonly").openCursor();
        cur.onsuccess = (e) => {
          const c = e.target.result;
          if (c) { out.push(c.value); c.continue(); } else resolve(out);
        };
        cur.onerror = () => reject(cur.error);
      });
    }
    function add(rec) {
      return new Promise((resolve, reject) => {
        const r = tx("readwrite").add(rec);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    }
    function del(id) {
      return new Promise((resolve, reject) => {
        const r = tx("readwrite").delete(id);
        r.onsuccess = () => resolve();
        r.onerror = () => reject(r.error);
      });
    }

    // Downscale a selected image to keep storage small
    function resizeImage(file) {
      return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        img.onload = () => {
          const max = 1280;
          let { width, height } = img;
          if (width > max || height > max) {
            const scale = Math.min(max / width, max / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        reader.readAsDataURL(file);
      });
    }

    async function render() {
      const photos = await getAll();
      grid.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = photos.length ? "none" : "block";
      photos
        .slice()
        .reverse()
        .forEach((p) => {
          const card = document.createElement("div");
          card.className = "mem-card";
          card.innerHTML =
            `<img src="${p.data}" alt="${p.stop || "memory"}" loading="lazy"/>
             <span class="mem-tag">${p.stop || ""}</span>
             <button class="mem-del" title="Delete" data-id="${p.id}">✕</button>`;
          grid.appendChild(card);
        });
    }

    grid.addEventListener("click", async (e) => {
      const btn = e.target.closest(".mem-del");
      if (!btn) return;
      if (confirm("Remove this photo?")) {
        await del(Number(btn.dataset.id));
        render();
      }
    });

    input.addEventListener("change", async () => {
      const files = Array.from(input.files || []);
      const stopName = select.options[select.selectedIndex]
        ? select.options[select.selectedIndex].textContent
        : "";
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const data = await resizeImage(file);
        await add({ data: data, stop: stopName, ts: Date.now() });
      }
      input.value = "";
      render();
    });

    openDB()
      .then((d) => { db = d; render(); })
      .catch((err) => {
        console.warn("IndexedDB unavailable:", err);
        if (emptyMsg) emptyMsg.textContent = "Photo storage isn't available in this browser.";
      });
  })();

  /* ---------- PWA: register service worker for offline use ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
})();
