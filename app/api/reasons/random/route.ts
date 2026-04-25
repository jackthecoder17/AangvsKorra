import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.reason.count();

  if (count === 0) {
    return NextResponse.json({ message: "No reasons found" }, { status: 404 });
  }

  const randomIndex = Math.floor(Math.random() * count);

  const [reason] = await prisma.reason.findMany({
    skip: randomIndex,
    take: 1,
  });

  return NextResponse.json(reason);
}
