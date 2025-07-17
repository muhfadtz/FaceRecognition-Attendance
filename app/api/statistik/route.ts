import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalSiswa = await prisma.karyawan.count({
      where: { status: "Siswa" },
    });

    const totalGuru = await prisma.karyawan.count({
      where: { status: { in: ["Teacher", "Walikelas"] } },
    });

    // Logika untuk kehadiran dan pembayaran SPP bisa lebih kompleks
    // dan mungkin memerlukan query yang lebih spesifik.
    // Di sini saya akan menggunakan nilai dummy.
    const kehadiranHariIni = 95; // Dummy value
    const pembayaranLunasBulanIni = 80; // Dummy value

    return NextResponse.json({
      totalSiswa,
      totalGuru,
      kehadiranHariIni,
      pembayaranLunasBulanIni,
    });
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
