import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  try {
    const karyawan = await prisma.karyawan.findMany({
      where: {
        status: role as Role,
      },
    });
    return NextResponse.json(karyawan);
  } catch (error) {
    console.error("Error fetching karyawan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
