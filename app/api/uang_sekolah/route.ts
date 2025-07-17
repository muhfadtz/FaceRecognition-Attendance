import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bulan = parseInt(searchParams.get("bulan") || "0");
  const tahun = parseInt(searchParams.get("tahun") || "0");

  try {
    const siswa = await prisma.karyawan.findMany({
      where: {
        status: "Siswa",
      },
      include: {
        uangSekolah: {
          where: {
            bulan,
            tahun,
          },
        },
      },
    });
    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error fetching uang sekolah:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    const { siswaId, bulan, tahun, jumlah } = await request.json();

    try {
        const pembayaran = await prisma.uangSekolah.create({
            data: {
                siswaId,
                bulan,
                tahun,
                jumlah,
                status: "Lunas",
                tanggalBayar: new Date(),
            }
        });
        return NextResponse.json(pembayaran);
    } catch (error) {
        console.error("Error creating uang sekolah:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
