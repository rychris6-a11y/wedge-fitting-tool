// components/WedgeFittingResult.tsx

interface WedgeProduct {
  id: string;
  brand: string;
  model: string;
  loftDeg: number;
  grind: string;
  bounceDeg: number;
  bestFor: string;
  priceUsdEst: number | null;
  productUrl: string | null;
}

interface WedgeFittingResultProps {
  recommendedLofts: { gapWedge: number; sandWedge: number; lobWedge: number };
  bounceRange: { low: number; high: number; reason: string };
  recommendedProducts: WedgeProduct[];
}

export default function WedgeFittingResult({
  recommendedLofts,
  bounceRange,
  recommendedProducts,
}: WedgeFittingResultProps) {
  // Group products by which loft slot they fill, so the page reads as
  // "here's your gap wedge, here's your sand wedge" rather than one
  // flat list the user has to sort out themselves.
  const groups: { label: string; loft: number }[] = [
    { label: "Gap wedge", loft: recommendedLofts.gapWedge },
    { label: "Sand wedge", loft: recommendedLofts.sandWedge },
    { label: "Lob wedge", loft: recommendedLofts.lobWedge },
  ];

  return (
    <div className="wedge-result">
      <div className="compat-banner compat-ok">
        <p className="compat-verdict">Here's your wedge setup</p>
        <p className="compat-detail">
          Based on your miss and the courses you play, you want a bounce
          around {bounceRange.low}-{bounceRange.high}°. {bounceRange.reason}.
        </p>
      </div>

      {groups.map((group) => {
        const matches = recommendedProducts.filter((p) => p.loftDeg === group.loft);
        return (
          <div key={group.label} className="wedge-group">
            <div className="wedge-marker">{group.loft}°</div>
            <div className="wedge-group-content">
              <p className="wedge-group-title">{group.label}</p>
              {matches.length > 0 ? (
                <div className="compat-products-list">
                  {matches.map((p) => (
                    <a
                      key={p.id}
                      href={p.productUrl ?? "#"}
                      className="compat-product-card"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                    >
                      <span className="compat-product-name">
                        {p.brand} {p.model} — {p.loftDeg}° {p.bounceDeg}°
                      </span>
                      <span className="compat-product-arrow" aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="wedge-no-match">
                  No exact match yet in our database for this loft and bounce —
                  ask for a {group.loft}° wedge with {bounceRange.low}-{bounceRange.high}°
                  bounce next time you're at a golf shop.
                </p>
              )}
            </div>
          </div>
        );
      })}

      <p className="compat-disclosure">
        These links go to TGW and other golf retailers. We may earn a
        commission if you buy through them — it doesn't cost you extra.{" "}
        <a href="/guide#sources">How we back these recommendations</a>
      </p>
    </div>
  );
}
