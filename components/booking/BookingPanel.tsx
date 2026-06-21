"use client";

import { useState } from "react";
import {
  PACKAGES,
  MOOD_ORDER,
  SAMPLE_ARRIVALS,
  formatINR,
  moodFillGradient,
  type MoodId,
} from "@/content/packages";
import { track } from "@/lib/analytics";
import { BUSINESS, whatsappLink } from "@/lib/site-config";

/**
 * The mood-picker booking flow (build spec §5). Real enquiry capture for launch —
 * no live payment yet (Razorpay is the Phase 4 fast-follow). On "Request these
 * dates" we:
 *   1. open WhatsApp with a prefilled enquiry (the guaranteed delivery channel),
 *   2. POST the same enquiry to /api/enquiry (owner email + server log fallback),
 *   3. show an honest "request received" state (NOT a false instant confirmation).
 *
 * Funnel: select_mood → request_dates → whatsapp_click / enquiry_sent. Phase 4
 * inserts payment → confirmed between request and arrival without a rewrite.
 */
export function BookingPanel() {
  const [mood, setMood] = useState<MoodId>("room");
  const [arriveIdx, setArriveIdx] = useState(0);
  const [nights, setNights] = useState(2);
  const [booked, setBooked] = useState(false);

  const pkg = PACKAGES[mood];
  const effectiveNights = Math.max(pkg.minNights, nights);
  const total = pkg.rate * effectiveNights;
  const arriveLabel = SAMPLE_ARRIVALS[arriveIdx];
  const nightsLabel = `${effectiveNights} ${effectiveNights === 1 ? "night" : "nights"}`;

  const enquiryMessage =
    `Hello House of Hulda! I'd like to enquire about a stay.\n\n` +
    `• Stay: ${pkg.name}\n` +
    `• Arrive: ${arriveLabel}\n` +
    `• Nights: ${effectiveNights}\n` +
    `• Indicative total: ${formatINR(total)}\n\n` +
    `Could you confirm availability?`;

  const selectMood = (id: MoodId) => {
    setMood(id);
    setNights((n) => Math.max(PACKAGES[id].minNights, n));
    track("select_mood", { mood: id });
  };

  const requestDates = () => {
    track("request_dates", {
      mood,
      arrive: arriveLabel,
      nights: effectiveNights,
      value: total,
    });

    // Primary channel: open WhatsApp with the enquiry prefilled.
    track("whatsapp_click", { source: "booking_panel", mood });
    window.open(whatsappLink(enquiryMessage), "_blank", "noopener,noreferrer");

    // Fallback capture: owner email + server log (best-effort, never blocks UI).
    void fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood,
        packageName: pkg.name,
        arrive: arriveLabel,
        nights: effectiveNights,
        total,
      }),
    }).catch(() => {
      /* WhatsApp already opened — email is best-effort. */
    });

    track("enquiry_sent", { mood, value: total });
    setBooked(true);
  };

  return (
    <div className="w-[min(1040px,96vw)] rounded-[20px] border border-white/12 bg-[rgba(18,15,12,0.5)] p-[clamp(20px,3vw,34px)] shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-[14px]">
      {/* mood picker */}
      <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {MOOD_ORDER.map((id) => {
          const m = PACKAGES[id];
          const active = id === mood;
          return (
            <button
              key={id}
              onClick={() => selectMood(id)}
              aria-pressed={active}
              className="relative overflow-hidden rounded-[13px] border border-white/12 bg-white/[0.04] px-[16px] pb-[18px] pt-[16px] text-left text-cream transition-colors hover:bg-white/[0.07]"
            >
              {active && (
                <span className="pointer-events-none absolute inset-0 rounded-[13px] border-[1.5px] border-[rgba(217,154,78,0.9)] shadow-[0_0_0_1px_rgba(217,154,78,0.5),inset_0_0_30px_rgba(217,154,78,0.16)]" />
              )}
              <div className="font-display text-[21px] leading-[1.1]">{m.name}</div>
              <div className="mt-[8px] text-[10px] uppercase tracking-[0.12em] text-cream/55">
                {m.tag}
              </div>
            </button>
          );
        })}
      </div>

      {!booked ? (
        <div className="mt-[22px] grid items-stretch gap-[clamp(18px,3vw,32px)] md:[grid-template-columns:1fr_0.92fr]">
          {/* real photograph of the selected stay */}
          <div
            className="relative min-h-[240px] overflow-hidden rounded-[14px]"
            style={{ background: moodFillGradient(pkg.accent) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={pkg.image}
              src={pkg.image}
              alt={pkg.label}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-end p-[20px]">
              <div className="font-body text-[10px] uppercase leading-[1.7] tracking-[0.08em] text-white/85">
                {pkg.label}
              </div>
            </div>
          </div>

          {/* details + dates */}
          <div className="flex flex-col">
            <h3 className="m-0 font-display text-[clamp(26px,3vw,38px)] font-medium leading-[1.05]">
              {pkg.name}
            </h3>
            <p className="mb-0 mt-[14px] text-[14px] font-light leading-[1.65] text-cream/80">
              {pkg.blurb}
            </p>

            <div className="mt-[14px] flex flex-wrap gap-[8px]">
              {pkg.inclusions.map((inc) => (
                <span
                  key={inc}
                  className="rounded-full border border-white/15 px-[11px] py-[5px] text-[10px] tracking-[0.08em] text-cream/75"
                >
                  {inc}
                </span>
              ))}
            </div>

            <div className="mt-[24px] flex flex-wrap items-end gap-[24px]">
              <label className="flex flex-col gap-[8px]">
                <span className="text-[9.5px] uppercase tracking-[0.2em] text-cream/55">Arrive</span>
                <select
                  value={arriveIdx}
                  onChange={(e) => setArriveIdx(Number(e.target.value))}
                  className="cursor-pointer rounded-[9px] border border-white/20 bg-white/[0.06] px-[12px] py-[10px] font-body text-[14px] text-cream"
                >
                  {SAMPLE_ARRIVALS.map((a, i) => (
                    <option key={a} value={i} className="text-ink">
                      {a}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-[8px]">
                <span className="text-[9.5px] uppercase tracking-[0.2em] text-cream/55">Nights</span>
                <div className="flex items-center gap-[14px] rounded-[9px] border border-white/20 bg-white/[0.06] px-[12px] py-[6px]">
                  <button
                    onClick={() => setNights((n) => Math.max(pkg.minNights, n - 1))}
                    aria-label="Fewer nights"
                    className="px-[4px] text-[20px] leading-none text-cream"
                  >
                    −
                  </button>
                  <span className="min-w-[64px] text-center text-[15px]">{nightsLabel}</span>
                  <button
                    onClick={() => setNights((n) => n + 1)}
                    aria-label="More nights"
                    className="px-[4px] text-[20px] leading-none text-cream"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-end justify-between gap-[18px] pt-[26px]">
              <div>
                <div className="font-display text-[32px] leading-none">{formatINR(total)}</div>
                <div className="mt-[6px] text-[10.5px] tracking-[0.1em] text-cream/55">
                  {formatINR(pkg.rate)} / {pkg.rateUnit} · night · {formatINR(total)} total
                </div>
              </div>
              <button
                onClick={requestDates}
                className="rounded-full bg-amber px-[28px] py-[15px] text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_10px_30px_rgba(217,154,78,0.3)] transition-transform hover:scale-[1.03]"
              >
                Request these dates
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-[22px] px-[20px] py-[36px] text-center">
          <div className="mx-auto mb-[22px] flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[rgba(217,154,78,0.8)] bg-[radial-gradient(circle,rgba(217,154,78,0.25),transparent)]">
            <span className="text-[24px] text-amber">✓</span>
          </div>
          <h3 className="m-0 font-display text-[clamp(30px,4vw,52px)] font-medium leading-none">
            Request received.
          </h3>
          <p className="mb-[26px] mt-[14px] font-display text-[19px] italic text-cream/80">
            We&apos;ve opened WhatsApp with your dates — send it, and the light will be on for you.
          </p>
          <div className="inline-flex min-w-[min(420px,90vw)] flex-col gap-[10px] rounded-[14px] border border-white/15 bg-white/[0.05] px-[28px] py-[22px] text-left">
            <Row label="Stay" value={pkg.name} />
            <Row label="Arrive" value={`${arriveLabel} · ${nightsLabel}`} />
            <div className="my-[4px] h-px bg-white/12" />
            <div className="flex items-baseline justify-between gap-[30px]">
              <span className="text-[13px] text-cream/60">Total</span>
              <span className="font-display text-[26px]">{formatINR(total)}</span>
            </div>
          </div>
          <p className="mx-auto mt-[18px] max-w-[44ch] text-[11px] leading-[1.6] text-cream/45">
            If WhatsApp didn&apos;t open, message or call us directly — we confirm dates and share
            arrival details within a few hours.
          </p>
          <div className="mt-[20px] flex flex-wrap items-center justify-center gap-[16px]">
            <a
              href={whatsappLink(enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "confirmation", mood })}
              className="rounded-full bg-amber px-[22px] py-[12px] text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink"
            >
              Message us on WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS.phoneDisplay.replace(/\s/g, "")}`}
              className="text-[11.5px] uppercase tracking-[0.12em] text-cream/80 underline underline-offset-[5px]"
            >
              Call {BUSINESS.phoneDisplay}
            </a>
            <button
              onClick={() => setBooked(false)}
              className="text-[11.5px] uppercase tracking-[0.14em] text-cream/60 underline underline-offset-[5px]"
            >
              Modify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-[30px]">
      <span className="text-[13px] text-cream/60">{label}</span>
      <span className="text-[14px]">{value}</span>
    </div>
  );
}
