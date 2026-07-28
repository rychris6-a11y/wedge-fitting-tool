// app/api/wedge-fitting-check/route.ts
// Takes a pitching wedge loft + miss pattern + turf condition, and
// returns a recommended wedge lineup (gap/sand/lob lofts), a bounce
// range with plain-language reasoning, and matching real products.
// Mirrors the compatibility-check.ts pattern from the tow tool.

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

interface FittingRequest {
  pwLoft: number;
  missPattern: string;
  turfCondition: string;
}

export async function POST(req: NextRequest) {
  const body: FittingRequest = await req.json();
  const { pwLoft, missPattern, turfCondition } = body;

  if (!pwLoft || !missPattern || !turfCondition) {
    return NextResponse.json(
      { error: "Missing pwLoft, missPattern, or turfCondition." },
      { status: 400 }
    );
  }

  const pool = getPool();

  try {
    // Bounce range + plain-language reason for this miss/turf combo.
    const bounceResult = await pool.query(
      `select bounce_range_low as "low", bounce_range_high as "high", reason
       from bounce_recommendation_matrix
       where miss_pattern = $1 and turf_condition = $2`,
      [missPattern, turfCondition]
    );
    const bounce = bounceResult.rows[0] as { low: number; high: number; reason: string } | undefined;

    if (!bounce) {
      return NextResponse.json(
        { error: "Couldn't find a bounce recommendation for that combination." },
        { status: 404 }
      );
    }

    // Which loft bracket the pitching wedge falls into, to anchor gapping.
    const gappingResult = await pool.query(
      `select gap_wedge_loft as "gapLoft", sand_wedge_loft as "sandLoft", lob_wedge_loft as "lobLoft"
       from loft_gapping_reference
       where $1 between pw_loft_min and pw_loft_max
       limit 1`,
      [pwLoft]
    );
    // Fall back to the closest bracket if the PW loft is outside all
    // defined ranges (e.g. an unusually weak or strong pitching wedge).
    const gapping = gappingResult.rows[0] ?? { gapLoft: 52, sandLoft: 56, lobLoft: 60 };

    const targetLofts = [gapping.gapLoft, gapping.sandLoft, gapping.lobLoft];

    const productsResult = await pool.query(
      `select id, brand, model, loft_deg as "loftDeg", grind, bounce_deg as "bounceDeg",
              sole_width as "soleWidth", best_for as "bestFor", price_usd_est as "priceUsdEst", product_url as "productUrl"
       from wedge_products
       where active = true
         and needs_review = false
         and loft_deg = any($1)
         and bounce_deg between $2 and $3
       order by loft_deg asc`,
      [targetLofts, bounce.low, bounce.high]
    );

    return NextResponse.json({
      recommendedLofts: {
        gapWedge: gapping.gapLoft,
        sandWedge: gapping.sandLoft,
        lobWedge: gapping.lobLoft,
      },
      bounceRange: { low: bounce.low, high: bounce.high, reason: bounce.reason },
      recommendedProducts: productsResult.rows,
    });
  } catch (err) {
    console.error("wedge-fitting-check error:", err);
    return NextResponse.json({ error: "Something went wrong running that check." }, { status: 502 });
  }
}
