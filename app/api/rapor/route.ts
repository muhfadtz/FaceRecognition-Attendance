import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kelasId = parseInt(searchParams.get("kelasId") || "0");
  const tahunAkademikId = parseInt(searchParams.get("tahunAkademikId") || "0");

  try {
    const siswa = await prisma.karyawan.findMany({
      where: {
        kelasId: kelasId,
        status: "Siswa",
      },
      include: {
        rapor: {
          where: {
            tahunAkademikId,
          },
          include: {
            nilai: true,
          },
        },
      },
    });
    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error fetching rapor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
