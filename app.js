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
  const tl = document.getElementById("timeline");
  TRIP.days.forEach((day) => {
    const item = document.createElement("div");
    item.className = "tl-item";
    const dot = iconForTag(day.tag);
    item.innerHTML = `
      <div class="tl-dot">${dot}</div>
      <div class="tl-card">
        <span class="tl-date">${day.date}</span>
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

  /* ---------- Map (Google Maps) ---------- */
  // Called by the Google Maps script once it has loaded (see index.html).
  window.initMap = function initMap() {
    const mapEl = document.getElementById("googleMap");
    if (!mapEl || typeof google === "undefined") return;

    const map = new google.maps.Map(mapEl, {
      center: { lat: 34, lng: -78 },
      zoom: 5,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "cooperative",
    });

    const bounds = new google.maps.LatLngBounds();
    const path = [];
    const info = new google.maps.InfoWindow();

    TRIP.stops.forEach((stop, idx) => {
      const pos = { lat: stop.coords[0], lng: stop.coords[1] };
      path.push(pos);
      bounds.extend(pos);

      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: stop.name,
        label: { text: String(idx + 1), color: "#ffffff", fontWeight: "700", fontSize: "12px" },
      });

      const gmaps =
        "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(stop.name);
      marker.addListener("click", () => {
        info.setContent(
          `<div class="popup-title">${stop.icon} ${stop.name}</div>
           <div class="popup-sub">${stop.label} · ${stop.date}</div>
           <a class="popup-link" href="${gmaps}" target="_blank" rel="noopener">Open in Google Maps &rarr;</a>`
        );
        info.open({ anchor: marker, map: map });
      });
    });

    // Route line: follow the real roads using the Directions service.
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

    const toLatLng = (s) => ({ lat: s.coords[0], lng: s.coords[1] });

    function straightLine(stops, color) {
      if (stops.length < 2) return null;
      return new google.maps.Polyline({
        path: stops.map(toLatLng),
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: 3,
        map: map,
      });
    }

    function legPolylineOptions(color, dashed, zIndex) {
      if (dashed) {
        return {
          strokeColor: color,
          strokeOpacity: 0,
          zIndex: zIndex,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeColor: color,
                strokeOpacity: 1,
                strokeWeight: 5,
                scale: 3,
              },
              offset: "0",
              repeat: "18px",
            },
          ],
        };
      }
      return { strokeColor: color, strokeOpacity: 0.9, strokeWeight: 5, zIndex: zIndex };
    }

    // Creates a toggleable leg (returns an object with setVisible()).
    function createLeg(stops, color, dashed, zIndex) {
      const leg = { renderer: null, fallback: null, visible: true };
      leg.setVisible = function (v) {
        leg.visible = v;
        const tgt = v ? map : null;
        if (leg.renderer) leg.renderer.setMap(tgt);
        if (leg.fallback) leg.fallback.setMap(tgt);
      };
      if (stops.length < 2) return leg;

      if (!google.maps.DirectionsService) {
        leg.fallback = straightLine(stops, color);
        return leg;
      }

      const service = new google.maps.DirectionsService();
      leg.renderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // keep our own numbered markers
        preserveViewport: true,
        polylineOptions: legPolylineOptions(color, dashed, zIndex),
      });
      service.route(
        {
          origin: toLatLng(stops[0]),
          destination: toLatLng(stops[stops.length - 1]),
          waypoints: stops.slice(1, -1).map((s) => ({ location: toLatLng(s), stopover: true })),
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            leg.renderer.setDirections(result);
          } else {
            console.warn("Directions failed (" + status + "). Using straight lines.");
            leg.renderer.setMap(null);
            leg.renderer = null;
            leg.fallback = straightLine(stops, color);
          }
          if (!leg.visible) leg.setVisible(false);
        }
      );
      return leg;
    }

    // GO solid (underneath), BACK dashed on top so both show where roads overlap.
    const goLeg = createLeg(goStops, GO_COLOR, false, 1);
    const backLeg = createLeg(backStops, BACK_COLOR, true, 2);

    // Wire the show/hide checkboxes.
    const goCb = document.getElementById("toggleGo");
    const backCb = document.getElementById("toggleBack");
    if (goCb) goCb.addEventListener("change", (e) => goLeg.setVisible(e.target.checked));
    if (backCb) backCb.addEventListener("change", (e) => backLeg.setVisible(e.target.checked));

    map.fitBounds(bounds, 48);
  };

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
})();
