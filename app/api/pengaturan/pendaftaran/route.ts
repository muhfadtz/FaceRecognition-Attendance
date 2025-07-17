import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export async function GET() {
  try {
    let pengaturan = await prisma.pengaturanPendaftaran.findFirst();

    // Jika belum ada pengaturan, buat satu dengan nilai default (tidak aktif)
    if (!pengaturan) {
      pengaturan = await prisma.pengaturanPendaftaran.create({
        data: {
          isAktif: false,
        },
      });
    }

    return NextResponse.json(pengaturan);
  } catch (error) {
    console.error("Error fetching registration settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    try {
        const { isAktif } = await request.json();

        const pengaturan = await prisma.pengaturanPendaftaran.findFirst();

        if (!pengaturan) {
            return NextResponse.json({ error: "Pengaturan tidak ditemukan" }, { status: 404 });
        }

        const updatedPengaturan = await prisma.pengaturanPendaftaran.update({
            where: { id: pengaturan.id },
            data: { isAktif },
        });

        return NextResponse.json(updatedPengaturan);

    } catch (error) {
        console.error("Error updating registration settings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
