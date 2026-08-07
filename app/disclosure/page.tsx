import Link from "next/link";

export const metadata = { title: "Affiliate Disclosure | Wedge Fitting Calculator" };

export default function AffiliateDisclosure() {
  return (
    <main className="legal-page">
      <Link href="/" className="legal-back-link">← Back to calculator</Link>
      <h1>Affiliate Disclosure</h1>
      <p className="legal-updated">Last updated: August 6, 2026</p>
      <p>
        This Site participates in the affiliate program for TGW (The
        Golfer's World), via the CJ Affiliate network.
      </p>

      <h2>What that means for you</h2>
      <p>
        When you click certain product links and make a purchase, we may
        earn a small commission. <strong>This does not cost you anything
        extra</strong> — the price you pay is the same either way.
      </p>

      <h2>How we choose what to recommend</h2>
      <p>
        Wedge recommendations are based on the loft, bounce, and gapping
        logic you get from this tool — matched against real product specs,
        not prioritized by commission rate.
      </p>

      <h2>Questions</h2>
      <p>Contact us at WFCtools@gmail.com.</p>
    </main>
  );
}
