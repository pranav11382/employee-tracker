import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    const adminPw = await bcrypt.hash("Admin@123", 10);
    const userPw = await bcrypt.hash("User@123", 10);

    await prisma.user.createMany({
      data: [
        {
          email: "admin@company.com",
          password: adminPw,
          name: "Admin User",
          role: "admin",
          department: "Management",
          position: "System Administrator",
        },
        {
          email: "john@company.com",
          password: userPw,
          name: "John Smith",
          role: "user",
          department: "Engineering",
          position: "Software Engineer",
        },
        {
          email: "sarah@company.com",
          password: userPw,
          name: "Sarah Johnson",
          role: "user",
          department: "Design",
          position: "UI/UX Designer",
        },
        {
          email: "mike@company.com",
          password: userPw,
          name: "Mike Davis",
          role: "user",
          department: "Marketing",
          position: "Marketing Manager",
        },
      ],
    });

    return NextResponse.json({ message: "Seeded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
