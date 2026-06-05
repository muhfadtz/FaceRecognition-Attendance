const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    });
    console.log("Loaded environment variables from .env.local");
  }
} catch (err) {
  console.warn("Failed to load .env.local manually:", err.message);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking and seeding default settings...");
  const settings = await prisma.pengaturanAbsensi.findFirst();
  if (!settings) {
    const newSettings = await prisma.pengaturanAbsensi.create({
      data: {
        waktuMulaiAbsen: "07:00",
        batasTepatWaktu: "09:00",
        batasTerlambat: "14:00",
        waktuMulaiPulang: "16:00",
        batasWaktuPulang: "18:00",
        hariKerja: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      }
    });
    console.log("Default settings seeded successfully:", newSettings);
  } else {
    console.log("Settings already exist in database:", settings);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding settings:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
