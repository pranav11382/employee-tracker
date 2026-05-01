import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { todayStr } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};

  if (session.role === "admin") {
    if (userId) where.userId = userId;
  } else {
    where.userId = session.userId;
  }

  if (date) where.date = date;

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, department: true } },
      tasks: true,
    },
    orderBy: { clockIn: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();

  if (action === "clock-in") {
    const today = todayStr();
    const existing = await prisma.timeEntry.findFirst({
      where: { userId: session.userId, date: today, clockOut: null },
    });

    if (existing) {
      return NextResponse.json({ error: "Already clocked in" }, { status: 409 });
    }

    const entry = await prisma.timeEntry.create({
      data: { userId: session.userId, clockIn: new Date(), date: today },
      include: { tasks: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
  }

  if (action === "clock-out") {
    const today = todayStr();
    const entry = await prisma.timeEntry.findFirst({
      where: { userId: session.userId, date: today, clockOut: null },
    });

    if (!entry) {
      return NextResponse.json({ error: "Not clocked in" }, { status: 404 });
    }

    const updated = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { clockOut: new Date() },
      include: { tasks: true },
    });

    return NextResponse.json({ entry: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
