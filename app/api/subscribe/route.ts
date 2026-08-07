// app/api/subscribe/route.ts
// Adds an email to your Brevo contact list. Since someone typed
// their own email and clicked submit, this is genuine opt-in --
// very different from a purchased or scraped list. Uses Brevo's
// standard contact-creation endpoint (single opt-in); double
// opt-in (email confirmation before actually subscribing) is a
// worthwhile upgrade later, but requires setting up a confirmation
// email template in Brevo's dashboard first.

import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error("Brevo environment variables are not set.");
    return NextResponse.json({ error: "Signup isn't available right now. Try again later." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true, // if they already exist, just add them to this list rather than erroring
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      // Brevo returns 400 "duplicate_parameter" when the contact
      // already exists and updateEnabled didn't apply cleanly --
      // treat that as success from the user's perspective.
      if (data.code === "duplicate_parameter") {
        return NextResponse.json({ message: "You're already on the list!" });
      }
      console.error("Brevo error:", data);
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
    }

    return NextResponse.json({ message: "You're on the list!" });
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}

