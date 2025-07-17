import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const kelasId = parseInt(searchParams.get("kelasId") || "0");
    const tahunAkademikId = parseInt(searchParams.get("tahunAkademikId") || "0");

  try {
    const jadwalPelajaran = await prisma.jadwalPelajaran.findMany({
        where: {
            kelasId,
            tahunAkademikId,
        },
        include: {
            mataPelajaran: true,
            guru: true,
        }
    });
    return NextResponse.json(jadwalPelajaran);
  } catch (error) {
    console.error("Error fetching jadwal pelajaran:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const jadwalPelajaran = await prisma.jadwalPelajaran.create({
      data,
    });
    return NextResponse.json(jadwalPelajaran);
  } catch (error) {
    console.error("Error creating jadwal pelajaran:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, ...rest } = data;
    try {
        const jadwalPelajaran = await prisma.jadwalPelajaran.update({
            where: { id },
            data: rest,
        });
        return NextResponse.json(jadwalPelajaran);
    } catch (error) {
        console.error("Error updating jadwal pelajaran:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    try {
        await prisma.jadwalPelajaran.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Jadwal pelajaran dihapus" });
    } catch (error) {
        console.error("Error deleting jadwal pelajaran:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
