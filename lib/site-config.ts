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
    // TODO[launch]: exact street/landmark line for Google Business Profile parity
    line: "Naggar",
    locality: "Naggar",
    region: "Himachal Pradesh",
    country: "IN",
    postalCode: "175130",
  },
  // Exact pin from the "House Of Hulda Manali" Google Business Profile.
  geo: { lat: 32.1215824, lng: 77.1583061 },

  mapsUrl:
    "https://www.google.com/maps/place/House+Of+Hulda+Manali/@32.1215824,77.1583061,17z/data=!3m1!4b1!4m2!3m1!1s0x39048b079fa0bca1:0x1265b886fe50e657",

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
