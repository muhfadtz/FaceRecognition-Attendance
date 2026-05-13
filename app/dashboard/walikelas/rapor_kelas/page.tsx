"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Karyawan, Rapor } from "@prisma/client";

type SiswaWithRapor = Karyawan & {
  rapor: Rapor[];
};

const RaporKelasPage = () => {
  const [siswaList, setSiswaList] = useState<SiswaWithRapor[]>([]);

  useEffect(() => {
    // Fetch data siswa dan rapor untuk kelas yang diwalikan
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rapor Kelas</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Rata-rata Nilai</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siswaList.map(siswa => (
            <TableRow key={siswa.id}>
              <TableCell>{siswa.nama}</TableCell>
              <TableCell>
                {/* Hitung rata-rata nilai */}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Lihat Detail</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RaporKelasPage;
