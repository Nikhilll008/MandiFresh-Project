const MANDI_LIST = [
  "Lasalgaon Mandi, Nashik",
  "Azadpur Mandi, Delhi",
  "Vashi APMC, Navi Mumbai",
  "Pune Market Yard",
  "Indore Mandi, MP",
  "Ludhiana Grain Market",
  "Nizamabad Mandi, Telangana",
  "Coimbatore Mandi, TN",
  "Solapur APMC",
  "Kolar Mandi, Karnataka"
];

const CROP_LIST = [
  "Onion", "Tomato", "Potato", "Wheat", "Rice (Basmati)",
  "Soybean", "Cotton", "Maize", "Turmeric", "Chana (Gram)",
  "Groundnut", "Mustard Seed", "Green Chilli", "Sugarcane", "Banana"
];


function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildPriceRecords() {
  const rng = seededRandom(19822);
  const basePrices = {
    "Onion": 1850, "Tomato": 2200, "Potato": 1400, "Wheat": 2350,
    "Rice (Basmati)": 4200, "Soybean": 4650, "Cotton": 7200, "Maize": 2050,
    "Turmeric": 14500, "Chana (Gram)": 5300, "Groundnut": 6100,
    "Mustard Seed": 5450, "Green Chilli": 3800, "Sugarcane": 340, "Banana": 1200
  };
  const records = [];
  let id = 1;
  const today = new Date(2026, 5, 30); 

  CROP_LIST.forEach((crop) => {
    const mandiCount = 3 + Math.floor(rng() * 2);
    const shuffledMandis = [...MANDI_LIST].sort(() => rng() - 0.5).slice(0, mandiCount);
    shuffledMandis.forEach((mandi) => {
      const base = basePrices[crop];
      const drift = (rng() - 0.5) * 0.16;
      const current = Math.round(base * (1 + drift));
      const prevDrift = (rng() - 0.5) * 0.12;
      const previous = Math.round(current * (1 - prevDrift));
      const dateOffset = Math.floor(rng() * 3);
      const date = new Date(today);
      date.setDate(date.getDate() - dateOffset);

      records.push({
        id: id++,
        crop,
        mandi,
        date: date.toISOString().slice(0, 10),
        current,
        previous,
        unit: crop === "Sugarcane" ? "₹/quintal" : "₹/quintal"
      });
    });
  });
  return records;
}

const PRICE_RECORDS = buildPriceRecords();

function buildTrendSeries() {
  const rng = seededRandom(7734);
  const series = {};
  CROP_LIST.forEach((crop) => {
    const rec = PRICE_RECORDS.find((r) => r.crop === crop);
    const start = rec ? rec.previous : 2000;
    const points = [];
    let value = start * (0.92 + rng() * 0.08);
    for (let day = 0; day < 30; day++) {
      const noise = (rng() - 0.5) * 0.035;
      const trendPull = ((rec ? rec.current : start) - value) * 0.03;
      value = value * (1 + noise) + trendPull;
      points.push(Math.round(value));
    }
    series[crop] = points;
  });
  return series;
}

const TREND_SERIES = buildTrendSeries();

const TICKER_ITEMS = [
  { crop: "Onion", mandi: "Lasalgaon", price: 1798, change: 4.2 },
  { crop: "Tomato", mandi: "Pune", price: 2260, change: -3.1 },
  { crop: "Wheat", mandi: "Indore", price: 2410, change: 1.6 },
  { crop: "Cotton", mandi: "Nizamabad", price: 7085, change: -0.8 },
  { crop: "Potato", mandi: "Azadpur", price: 1362, change: 0.0 },
  { crop: "Soybean", mandi: "Indore", price: 4720, change: 2.3 },
  { crop: "Turmeric", mandi: "Nizamabad", price: 14890, change: 5.1 },
  { crop: "Chana (Gram)", mandi: "Solapur", price: 5215, change: -1.4 },
  { crop: "Groundnut", mandi: "Kolar", price: 6240, change: 1.1 },
  { crop: "Mustard Seed", mandi: "Ludhiana", price: 5390, change: -0.6 }
];
