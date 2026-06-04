import { NextRequest, NextResponse } from "next/server";

import { filterDataset, getDataset, getTopProducts } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const rows = filterDataset(
    getDataset(),
    params.get("startDate"),
    params.get("endDate"),
    params.get("category")
  );

  return NextResponse.json(getTopProducts(rows));
}
