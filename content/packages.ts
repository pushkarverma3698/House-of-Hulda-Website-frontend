/**
 * Stay options as DATA (editable without touching components). These map the
 * REAL product: a kathkuni heritage homestay + daytime café + creative retreat
 * in Naggar — private rooms, a shared attic-loft, the whole home for groups,
 * and a longer creative/workation residency.
 *
 * ⚠️ Rates below are PLACEHOLDERS marked TODO[rate] — set the real tariff before
 * launch. This is the seed the booking flow + any future channel-manager reads.
 */

export type MoodId = "room" | "loft" | "home" | "residency";

export interface Package {
  id: MoodId;
  name: string;
  tag: string;
  blurb: string;
  /** indicative per-night rate in INR — TODO[rate]: set real tariff */
  rate: number;
  /** unit the rate is charged in, shown to the guest */
  rateUnit: "room" | "bed" | "home";
  minNights: number;
  inclusions: string[];
  /** mood-fill panel label + accent (rgb) used in the booking UI */
  label: string;
  accent: [number, number, number];
  /** real photograph shown in the booking panel for this stay */
  image: string;
}

export const PACKAGES: Record<MoodId, Package> = {
  room: {
    id: "room",
    name: "A Private Room",
    tag: "Mud walls, lantern light",
    blurb:
      "Your own kathkuni room — hand-plastered walls, deodar beams, a warm lantern, and a bed dressed in Himachali wool. The valley wakes you; the café is one floor up.",
    rate: 2800,
    rateUnit: "room",
    minNights: 1,
    inclusions: ["Private room", "Himachali breakfast", "Café & orchard", "Hot water"],
    label: "Warm lantern light, mud & deodar, a guitar in the corner",
    accent: [217, 154, 78],
    image: "/images/room-lantern.jpg",
  },
  loft: {
    id: "loft",
    name: "The Attic Loft",
    tag: "A bed in the café loft",
    blurb:
      "A single bed under the eaves in our top-floor café-loft — for the solo wanderer and the easy-going group. Hippie floor-seating by day, soft lamplight by night, the orchard through the window.",
    rate: 900,
    rateUnit: "bed",
    minNights: 1,
    inclusions: ["Loft bed", "Shared bath", "Communal breakfast", "Café & bonfire"],
    label: "The attic café — ground cushions, low tables, apple trees outside",
    accent: [111, 147, 160],
    image: "/images/room-guitar.jpg",
  },
  home: {
    id: "home",
    name: "The Whole Home",
    tag: "For your people",
    blurb:
      "Take the entire kathkuni house — both rooms, the loft, the café, the orchard, the bonfire. Built for families, friends and trip groups who want the mountain to themselves.",
    rate: 9000,
    rateUnit: "home",
    minNights: 2,
    inclusions: ["Whole house", "Group meals", "Café & orchard", "Bonfire & stargazing"],
    label: "The full house — firelight, a long table, the valley below",
    accent: [194, 96, 58],
    image: "/images/arrival-golden-hour.jpg",
  },
  residency: {
    id: "residency",
    name: "Creative Residency",
    tag: "Work soft, stay long",
    blurb:
      "A slower, longer stay for makers, writers and remote workers. A quiet corner to work, fibre wifi, the café for breaks, and days that empty out so the page can fill.",
    rate: 2400,
    rateUnit: "room",
    minNights: 5,
    inclusions: ["Private room", "Work corner + wifi", "Half board", "Café & orchard"],
    label: "A desk by the window, books, the orchard beyond",
    accent: [156, 111, 158],
    image: "/images/room-day.jpg",
  },
};

export const MOOD_ORDER: MoodId[] = ["room", "loft", "home", "residency"];

/** Placeholder arrival dates — replace with a live calendar in a later phase. */
export const SAMPLE_ARRIVALS = [
  "Fri 11 Sep",
  "Fri 18 Sep",
  "Sat 26 Sep",
  "Fri 2 Oct",
  "Sat 10 Oct",
];

export const formatINR = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export function moodFillGradient(accent: [number, number, number]): string {
  const [r, g, b] = accent;
  return `linear-gradient(155deg, rgb(${r},${g},${b}) 0%, rgba(${Math.round(
    r * 0.4,
  )},${Math.round(g * 0.4)},${Math.round(b * 0.4)},0.95) 100%)`;
}
