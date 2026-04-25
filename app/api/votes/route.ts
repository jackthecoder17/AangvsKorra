import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensureTally() {
  return prisma.voteTally.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, aangVotes: 0, korraVotes: 0 },
  });
}

export async function GET() {
  const tally = await ensureTally();
  return NextResponse.json(tally);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { side?: "aang" | "korra" }
    | null;

  if (!body?.side || (body.side !== "aang" && body.side !== "korra")) {
    return NextResponse.json({ message: "Invalid vote side" }, { status: 400 });
  }

  await ensureTally();

  const tally = await prisma.voteTally.update({
    where: { id: 1 },
    data: body.side === "aang" ? { aangVotes: { increment: 1 } } : { korraVotes: { increment: 1 } },
  });

  return NextResponse.json(tally);
}
