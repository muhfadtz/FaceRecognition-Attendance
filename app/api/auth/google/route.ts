import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if admin email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com"
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
      return NextResponse.json({ role: "admin", nama: name || "Admin" })
    }

    // Check if karyawan email exists
    const karyawan = await prisma.karyawan.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (karyawan) {
      return NextResponse.json({ role: "user", nama: karyawan.nama })
    }

    // If B2B, we could optionally auto-create them, but for security we restrict to registered users.
    return NextResponse.json({ error: "Your email is not registered in Staffora. Contact your administrator." }, { status: 403 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
