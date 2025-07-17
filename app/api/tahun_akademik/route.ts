import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tahunAkademik = await prisma.tahunAkademik.findMany();
    return NextResponse.json(tahunAkademik);
  } catch (error) {
    console.error("Error fetching tahun akademik:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const tahunAkademik = await prisma.tahunAkademik.create({
      data,
    });
    return NextResponse.json(tahunAkademik);
  } catch (error) {
    console.error("Error creating tahun akademik:", error);
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
        const tahunAkademik = await prisma.tahunAkademik.update({
            where: { id },
            data: rest,
        });
        return NextResponse.json(tahunAkademik);
    } catch (error) {
        console.error("Error updating tahun akademik:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    try {
        await prisma.tahunAkademik.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Tahun akademik dihapus" });
    } catch (error) {
        console.error("Error deleting tahun akademik:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
