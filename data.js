/* =========================================================
   RoadTrip 2026 — Trip data
   Québec → Washington DC → Charleston → Orlando →
   Miami (cruise) → Savannah → Philadelphia → Québec
   June 23 – July 18, 2026
   ========================================================= */

const TRIP = {
  start: "2026-06-23T08:00:00",
  // Ordered stops used for the map route + markers
  stops: [
    {
      name: "Québec City",
      label: "Home — Departure",
      coords: [46.8139, -71.2080],
      date: "Jun 23",
      icon: "🏠",
      type: "home",
    },
    {
      name: "Wyndham Garden Washington DC North",
      label: "2 nights · Jun 23–25",
      coords: [39.1106, -76.8483], // DC North / Laurel MD area
      date: "Jun 23–25",
      icon: "🛏️",
      type: "stay",
    },
    {
      name: "Smithsonian National Air & Space Museum",
      label: "Morning · Jun 24",
      coords: [38.8882, -77.0199],
      date: "Jun 24",
      icon: "🚀",
      type: "activity",
    },
    {
      name: "National Mall — Food Trucks & Natural History Museum",
      label: "Lunch & afternoon · Jun 24",
      coords: [38.8913, -77.0260],
      date: "Jun 24",
      icon: "🦕",
      type: "activity",
    },
    {
      name: "Lincoln Memorial & Washington Monument",
      label: "Evening · Jun 24",
      coords: [38.8893, -77.0470],
      date: "Jun 24",
      icon: "🏛️",
      type: "activity",
    },
    {
      name: "Quality Inn Mount Pleasant",
      label: "1 night · Charleston · Jun 25–26",
      coords: [32.8323, -79.8284],
      date: "Jun 25–26",
      icon: "🛏️",
      type: "stay",
    },
    {
      name: "USS Yorktown — Patriots Point",
      label: "Morning · Jun 26",
      coords: [32.7910, -79.9085],
      date: "Jun 26",
      icon: "⚓",
      type: "activity",
    },
    {
      name: "Club Wyndham Cypress Palms",
      label: "1 week · Orlando · Jun 26–Jul 3",
      coords: [28.3279, -81.4892],
      date: "Jun 26–Jul 3",
      icon: "🎢",
      type: "stay",
    },
    {
      name: "PortMiami — Norwegian Escape",
      label: "Embark · Jul 5",
      coords: [25.7752, -80.1700],
      date: "Jul 5",
      icon: "🛳️",
      type: "cruise",
    },
    {
      name: "Miami — Friends",
      label: "Jul 12–15",
      coords: [25.7617, -80.1918],
      date: "Jul 12–15",
      icon: "🌴",
      type: "stay",
    },
    {
      name: "Savannah, GA",
      label: "Overnight · Jul 16",
      coords: [32.0809, -81.0912],
      date: "Jul 16",
      icon: "🌙",
      type: "stay",
    },
    {
      name: "Philadelphia, PA",
      label: "Overnight · Jul 17",
      coords: [39.9526, -75.1652],
      date: "Jul 17",
      icon: "🔔",
      type: "stay",
    },
    {
      name: "Québec City",
      label: "Home — Sweet Home",
      coords: [46.8139, -71.2080],
      date: "Jul 18",
      icon: "🏁",
      type: "home",
    },
  ],

  // Day-by-day timeline
  days: [
    {
      date: "Tue, Jun 23",
      title: "Québec → Washington DC",
      tag: "drive",
      drive: "~10 h · 900 km",
      items: [
        "Early departure from Québec City 🚐",
        "Cross the border and drive south through New York & Pennsylvania",
        "Evening check-in at Wyndham Garden DC North (2 nights)",
      ],
    },
    {
      date: "Wed, Jun 24",
      title: "Washington DC — Museums & Memorials",
      tag: "explore",
      items: [
        "🚀 Morning: National Air & Space Museum",
        "🌭 Lunch: National Mall food trucks",
        "🦕 Afternoon: National Museum of Natural History",
        "🏛️ Evening: Lincoln Memorial & Washington Monument",
      ],
    },
    {
      date: "Thu, Jun 25",
      title: "Washington DC → Charleston",
      tag: "drive",
      drive: "~8 h · 850 km",
      items: [
        "Scenic drive down the coast to South Carolina",
        "Check-in at Quality Inn Mount Pleasant",
        "Relax in historic Charleston 🌅",
      ],
    },
    {
      date: "Fri, Jun 26",
      title: "USS Yorktown, then Charleston → Orlando",
      tag: "drive",
      drive: "~6 h · 650 km",
      items: [
        "⚓ Morning: USS Yorktown at Patriots Point",
        "Drive south to Florida",
        "Check-in at Club Wyndham Cypress Palms (1 week!)",
      ],
    },
    {
      date: "Jun 26 – Jul 3",
      title: "Orlando — Theme Park Week",
      tag: "fun",
      items: [
        "🎢 A full week of theme parks & sunshine",
        "🏊 Pool days at the resort",
        "🍦 Family fun in the heart of Orlando",
      ],
    },
    {
      date: "Fri, Jul 3 – Sun, Jul 5",
      title: "Orlando → Miami",
      tag: "drive",
      drive: "~4 h · 380 km",
      items: [
        "Check out of Cypress Palms",
        "Head down to Miami",
        "Get ready to set sail 🛳️",
      ],
    },
    {
      date: "Sun, Jul 5 – Sun, Jul 12",
      title: "Norwegian Escape Cruise 🛳️",
      tag: "cruise",
      items: [
        "Embark at PortMiami on July 5",
        "7 nights at sea — sun, sea & adventure",
        "Return to Miami on July 12",
      ],
    },
    {
      date: "Jul 12 – Jul 15",
      title: "Miami with Friends",
      tag: "fun",
      items: [
        "🌴 Stay with friends in Miami",
        "🏖️ Beach days & good times",
        "Recharge before the trip home",
      ],
    },
    {
      date: "Wed, Jul 15",
      title: "Miami → North (homeward bound)",
      tag: "drive",
      drive: "Start of the journey home",
      items: [
        "Pack up and begin the drive back north",
        "Long road day toward Georgia",
      ],
    },
    {
      date: "Thu, Jul 16",
      title: "Savannah, GA",
      tag: "stay",
      items: [
        "🌙 Overnight in beautiful, historic Savannah",
        "Stroll the squares & oak-lined streets",
      ],
    },
    {
      date: "Fri, Jul 17",
      title: "Philadelphia, PA",
      tag: "stay",
      items: [
        "🔔 Overnight in Philadelphia",
        "A taste of American history",
      ],
    },
    {
      date: "Sat, Jul 18",
      title: "Philadelphia → Québec 🏁",
      tag: "drive",
      drive: "Final leg home",
      items: [
        "Last drive north across the border",
        "Home sweet home in Québec ❤️",
      ],
    },
  ],

  // Calendar events (all-day or timed) for ICS export
  events: [
    { start: "2026-06-23", end: "2026-06-25", title: "Stay: Wyndham Garden DC North", loc: "Washington DC" },
    { start: "2026-06-24T10:00", end: "2026-06-24T12:30", title: "Air & Space Museum", loc: "Washington DC" },
    { start: "2026-06-24T12:30", end: "2026-06-24T14:00", title: "Lunch — National Mall food trucks", loc: "National Mall, DC" },
    { start: "2026-06-24T14:00", end: "2026-06-24T17:00", title: "Natural History Museum", loc: "Washington DC" },
    { start: "2026-06-24T18:30", end: "2026-06-24T21:00", title: "Lincoln & Washington Memorials", loc: "Washington DC" },
    { start: "2026-06-25", end: "2026-06-26", title: "Stay: Quality Inn Mt Pleasant", loc: "Charleston, SC" },
    { start: "2026-06-26T09:00", end: "2026-06-26T11:30", title: "USS Yorktown — Patriots Point", loc: "Mt Pleasant, SC" },
    { start: "2026-06-26", end: "2026-07-03", title: "Stay: Club Wyndham Cypress Palms", loc: "Orlando, FL" },
    { start: "2026-07-05", end: "2026-07-12", title: "Norwegian Escape Cruise", loc: "PortMiami" },
    { start: "2026-07-12", end: "2026-07-15", title: "Miami with friends", loc: "Miami, FL" },
    { start: "2026-07-16", end: "2026-07-17", title: "Overnight: Savannah", loc: "Savannah, GA" },
    { start: "2026-07-17", end: "2026-07-18", title: "Overnight: Philadelphia", loc: "Philadelphia, PA" },
    { start: "2026-07-18", end: "2026-07-19", title: "Home in Québec 🏁", loc: "Québec City" },
  ],
};

/* Date range [startISO, endISO] for each timeline day (same order as TRIP.days).
   Used to highlight "today" during the trip. */
TRIP.dayRanges = [
  ["2026-06-23", "2026-06-23"], // Québec → DC
  ["2026-06-24", "2026-06-24"], // DC museums
  ["2026-06-25", "2026-06-25"], // DC → Charleston
  ["2026-06-26", "2026-06-26"], // Yorktown → Orlando
  ["2026-06-26", "2026-07-03"], // Orlando week
  ["2026-07-03", "2026-07-05"], // Orlando → Miami
  ["2026-07-05", "2026-07-12"], // Cruise
  ["2026-07-12", "2026-07-15"], // Miami friends
  ["2026-07-15", "2026-07-15"], // Depart Miami
  ["2026-07-16", "2026-07-16"], // Savannah
  ["2026-07-17", "2026-07-17"], // Philadelphia
  ["2026-07-18", "2026-07-18"], // Home
];

/* Packing checklist */
TRIP.packing = {
  "📄 Documents": [
    "Passports (everyone)",
    "Cruise boarding documents",
    "Driver's license & car registration",
    "Travel + health insurance cards",
    "Hotel & cruise confirmations",
    "Some US cash + credit cards",
  ],
  "👕 Clothing": [
    "Summer clothes (hot & humid!)",
    "Swimsuits (x2 each)",
    "Light rain jacket / poncho",
    "Comfortable walking shoes",
    "Sandals / flip-flops",
    "One nicer outfit for cruise dinners",
    "Sun hats & caps",
  ],
  "🏖️ Beach & Pool": [
    "Sunscreen (SPF 50+)",
    "After-sun / aloe",
    "Beach towels",
    "Goggles for the kids",
    "Reusable water bottles",
  ],
  "🔌 Electronics": [
    "Phone chargers & cables",
    "Car phone mount",
    "Power bank",
    "Camera",
    "Headphones / tablet for kids",
  ],
  "🚗 Car & Road": [
    "First-aid kit",
    "Snacks & cooler",
    "Paper map / offline maps downloaded",
    "Window shades for kids",
    "Trash bags & wet wipes",
    "Spare tire & jack checked",
  ],
  "🧒 Kids": [
    "Favorite toys / comfort items",
    "Travel games & activity books",
    "Kids' medication",
    "Extra clothes within reach",
  ],
  "🧴 Toiletries & Health": [
    "Toothbrushes & toiletries",
    "Bug spray",
    "Motion-sickness remedy",
    "Pain reliever & basic meds",
    "Hand sanitizer",
  ],
};
