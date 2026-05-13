import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const mataPelajaran = await prisma.mataPelajaran.findMany();
    return NextResponse.json(mataPelajaran);
  } catch (error) {
    console.error("Error fetching mata pelajaran:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const mataPelajaran = await prisma.mataPelajaran.create({
      data,
    });
    return NextResponse.json(mataPelajaran);
  } catch (error) {
    console.error("Error creating mata pelajaran:", error);
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
        const mataPelajaran = await prisma.mataPelajaran.update({
            where: { id },
            data: rest,
        });
        return NextResponse.json(mataPelajaran);
    } catch (error) {
        console.error("Error updating mata pelajaran:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    try {
        await prisma.mataPelajaran.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Mata pelajaran dihapus" });
    } catch (error) {
        console.error("Error deleting mata pelajaran:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
