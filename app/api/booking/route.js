import { NextResponse } from 'next/server';

// Sends booking request email via Resend.
// Set RESEND_API_KEY and BOOKING_EMAIL in .env.local
export async function POST(request) {
  try {
    const data = await request.json();
    const { checkIn, checkOut, room, guests, name, email, phone, requests } = data;

    // Validate required fields
    if (!checkIn || !checkOut || !room || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_EMAIL || 'bookings@houseofhulda.com';

    if (!apiKey) {
      // In development without Resend key, log and return success
      console.log('[Booking Request]', data);
      return NextResponse.json({ success: true, dev: true });
    }

    const nights = Math.round(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );

    const emailBody = `
New Booking Request — House of Hulda
=====================================

Name: ${name}
Phone / WhatsApp: ${phone}
${email ? `Email: ${email}` : ''}

Room: ${room}
Check-in: ${checkIn}
Check-out: ${checkOut}
Nights: ${nights}
Guests: ${guests}
${requests ? `\nSpecial Requests:\n${requests}` : ''}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'bookings@houseofhulda.com',
        to: [toEmail],
        subject: `New Booking Request — ${name} · ${checkIn}`,
        text: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Resend Error]', err);
      return NextResponse.json({ error: 'Email failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Booking API Error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
