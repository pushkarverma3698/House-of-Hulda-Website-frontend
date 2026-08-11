/**
 * SINGLE SOURCE OF TRUTH for all real business values.
 *
 * ⚠️ FILL THE VALUES MARKED `// TODO[launch]` BEFORE GOING LIVE. Every component,
 * the JSON-LD schema, the enquiry flow, and the footer read from here — so you
 * change a phone number or host name in ONE place, never hunt through the code.
 *
 * Phone format rules:
 *  - `whatsappNumber`  → digits only, with country code, NO "+" or spaces
 *                        (this is what wa.me/<number> needs). e.g. "919418000000"
 *  - `phoneDisplay`    → pretty version shown to humans. e.g. "+91 94180 00000"
 *  - schema.ts telephone uses E.164 → "+919418000000"
 */

export const BUSINESS = {
  name: "House of Hulda Manali",
  legalName: "House of Hulda Manali",

  whatsappNumber: "918284008838",
  phoneDisplay: "+91 82840 08838",
  email: "houseofhuldamanali@gmail.com",

  // Hosts are referred to by the house voice until real names are confirmed.
  hostNames: "The House of Hulda family",
  chefName: "our kitchen",

  url: "https://houseofhuldamanali.com",

  address: {
    line: "Rumsu, Naggar",
    locality: "Naggar",
    region: "Himachal Pradesh",
    country: "IN",
    postalCode: "175130",
  },
  // Exact coordinates for Rumsu, Naggar at 2,180m elevation
  geo: { lat: 32.1198, lng: 77.1731 },

  mapsUrl:
    "https://www.google.com/maps/place/House+Of+Hulda+Manali/@32.1198,77.1731,17z",

  social: {
    instagram: "https://www.instagram.com/houseofhuldamanali/",
    airbnb:
      "https://www.airbnb.co.in/rooms/1689928290306679839",
  },
} as const;

/** Pretty wa.me deep-link with an optional prefilled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const COMMON_FAQ = [
  {
    q: "Is House of Hulda a private home or a shared stay?",
    a: "Both. You can book a private kathkuni room, a single bed in our shared attic-loft, or the whole house for your group.",
  },
  {
    q: "Do you serve food?",
    a: "Yes — our kitchen serves authentic Himachali home-cooked thalis, mountain breakfasts, and fresh coffee. The attic-loft café is open through the daytime.",
  },
  {
    q: "How is the WiFi speed for remote work?",
    a: "We have high-speed, stable fiber broadband that covers the entire property, including the private rooms, deck, and attic café. It's reliable for video calls and remote work.",
  },
  {
    q: "How do I reach Naggar from Manali?",
    a: "Naggar sits quietly above the Beas river, about 22 km from Manali (a 45-minute taxi drive) and 30 km from Bhuntar Airport. It's easily reachable by car or local taxi.",
  },
  {
    q: "How do I book?",
    a: "Book direct via WhatsApp or our website for the best rate and instant personal confirmation from your hosts.",
  },
];
