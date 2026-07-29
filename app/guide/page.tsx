// app/guide/page.tsx
// Supports two things at once: gives Google specific long-tail
// queries to rank (wedge bounce, loft gapping) and gives forum
// replies something real to point to beyond the bare calculator link.

export const metadata = {
  title: "Wedge Bounce and Loft Gapping Explained | Wedge Fitting Calculator",
  description:
    "A plain-language guide to wedge bounce, grind, and loft gapping — what they actually mean, why they matter, and how to figure out what you need without the jargon.",
};

export default function Guide() {
  return (
    <main className="legal-page">
      <h1>Wedge bounce and loft gapping, explained without the jargon</h1>
      <p className="legal-updated">
        The short version: two numbers matter for your wedges — bounce and
        loft gapping — and neither one requires you to know anything about
        club fitting to get right.
      </p>

      <h2>What is wedge bounce?</h2>
      <p>
        Bounce is how much the sole of the club sticks out below the leading
        edge. Picture the bottom of the club — bounce is the angle that
        keeps that bottom edge from digging straight into the ground.
      </p>
      <p>
        More bounce means the club skids across the turf more easily instead
        of digging in. Less bounce means the leading edge can get under the
        ball more easily, but it's also more likely to dig in if you hit
        slightly behind the ball.
      </p>
      <p>
        <strong>Neither is "better"</strong> — the right amount depends on
        how you typically miss and what kind of ground you're usually
        playing off of. That's the whole idea behind this calculator: it
        asks about your miss and your course conditions instead of asking
        you to already know your ideal bounce number.
      </p>

      <h2>How much bounce do you actually need?</h2>
      <ul>
        <li>
          <strong>If you tend to chunk it (hit behind the ball):</strong>{" "}
          more bounce, generally 10-14°, helps the club slide through instead
          of digging in further.
        </li>
        <li>
          <strong>If you tend to hit it thin:</strong> lower bounce, generally
          6-10°, lets the leading edge get under the ball more easily.
        </li>
        <li>
          <strong>Soft or wet turf</strong> generally calls for more bounce
          than firm, dry conditions, regardless of your miss pattern.
        </li>
        <li>
          <strong>Greenside bunkers</strong> generally want more bounce too —
          it keeps the club from burying in the sand.
        </li>
      </ul>

      <h2>What is loft gapping, and why does it matter?</h2>
      <p>
        Loft gapping is the difference in degrees between each of your
        clubs. For full-swing distance control, you want roughly a 4-6°
        gap between every club in your bag, including between your pitching
        wedge and your next wedge.
      </p>
      <p>
        This trips people up more than it should, because modern pitching
        wedges are often stronger-lofted (lower degree numbers) than older
        iron sets used to be — meaning a pitching wedge that's 45-46° now
        often needs a dedicated gap wedge around 50° to avoid a big jump
        straight to a 56° sand wedge.
      </p>
      <p>
        If you've ever felt stuck between clubs on an approach shot —
        too much club for a soft swing, not enough for a full one — a loft
        gap that's too wide is often exactly why.
      </p>

      <h2>What about grind?</h2>
      <p>
        Grind refers to how the sole of the wedge is shaped — how much
        material is removed from the heel, toe, or trailing edge. It's a
        real factor in fitting, but it's also the one variable where most
        golfers, including good ones, don't need to think much about it.
        A standard, versatile grind (often labeled something like "S" or
        "Mid") covers the vast majority of recreational golfers well. Grind
        becomes more relevant at lower handicaps or for players who
        regularly open the clubface for specialty shots.
      </p>

      <h2>Try the calculator</h2>
      <p>
        If you'd rather skip figuring this out manually, <a href="/">the wedge fitting calculator</a> asks
        about your miss and your typical course conditions, then gives you a
        specific bounce range, loft gapping, and matching product
        recommendations — no fitting terminology required.
      </p>
    </main>
  );
}
