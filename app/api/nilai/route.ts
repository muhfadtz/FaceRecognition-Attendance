import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { raporId, mataPelajaranId, nilai, catatanGuru } = await request.json();

  try {
    const nilaiSiswa = await prisma.nilai.create({
      data: {
        raporId,
        mataPelajaranId,
        nilai,
        catatanGuru,
      },
    });
    return NextResponse.json(nilaiSiswa);
  } catch (error) {
    console.error("Error creating nilai:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    const { id, nilai, catatanGuru } = await request.json();

    try {
        const nilaiSiswa = await prisma.nilai.update({
            where: { id },
            data: {
                nilai,
                catatanGuru,
            },
        });
        return NextResponse.json(nilaiSiswa);
    } catch (error) {
        console.error("Error updating nilai:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
