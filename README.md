# 🚐 RoadTrip 2026 — Québec → Miami → Québec

A modern, single-page web app to remember our big family adventure
**June 23 – July 18, 2026** (~6,500 km, 5 travellers).

## ✨ Features
- **Hero** with your family photo, animated countdown to departure
- **Day-by-day timeline** of the whole journey
- **Interactive map** (Leaflet) with every stop + one-tap **Google Maps** links
- **Stays** cards for each hotel / resort / cruise
- **Calendar export**: download the trip as a `.ics` file (Google / Apple / Outlook)
  and a quick "Add to Google Calendar" link
- Fully **responsive**, no build step, no API keys needed

## 🗺️ The Journey
| Dates | Stop |
|---|---|
| Jun 23–25 | Wyndham Garden DC North (Washington) |
| Jun 24 | Air & Space · National Mall food trucks · Natural History · Lincoln & Washington memorials |
| Jun 25–26 | Quality Inn Mt Pleasant (Charleston) |
| Jun 26 | USS Yorktown → drive to Orlando |
| Jun 26 – Jul 3 | Club Wyndham Cypress Palms (Orlando) |
| Jul 5–12 | Norwegian Escape cruise (PortMiami) |
| Jul 12–15 | Miami with friends |
| Jul 16 | Savannah |
| Jul 17 | Philadelphia |
| Jul 18 | Home in Québec 🏁 |

## ▶️ Run it
Just open `index.html` in a browser. Or serve it locally:

```pwsh
# from this folder
python -m http.server 5500
# then open http://localhost:5500
```

## 📸 Add the family photo
Save the hammock photo as `images/family.jpg`. A gradient shows if it's missing.

## 🛠️ Customize
- Trip stops, days, and calendar events live in **`data.js`** — edit freely.
- Colours & look live in **`styles.css`** (`:root` variables at the top).
