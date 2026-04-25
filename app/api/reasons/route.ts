import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20;
  const skip = (safePage - 1) * safeLimit;

  const where = {
    ...(category ? { category } : {}),
    ...(q ? { text: { contains: q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.reason.findMany({
      where,
      orderBy: { rank: "asc" },
      skip,
      take: safeLimit,
    }),
    prisma.reason.count({ where }),
  ]);

  return NextResponse.json({
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
    items,
  });
}
