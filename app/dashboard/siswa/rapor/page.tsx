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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rapor, Nilai, MataPelajaran, TahunAkademik } from "@prisma/client";

type RaporDetail = Rapor & {
  nilai: (Nilai & { mataPelajaran: MataPelajaran })[];
  tahunAkademik: TahunAkademik;
};

const RaporSiswaPage = () => {
  const [raporList, setRaporList] = useState<RaporDetail[]>([]);
  const [selectedRapor, setSelectedRapor] = useState<RaporDetail | null>(null);

  useEffect(() => {
    // Fetch data rapor untuk siswa yang sedang login
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rapor Digital</h1>
      <div className="mb-4">
        {/* Select untuk memilih tahun akademik/semester */}
      </div>
      {selectedRapor && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Tahun Akademik {selectedRapor.tahunAkademik.tahun} - {selectedRapor.tahunAkademik.semester}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Catatan Guru</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRapor.nilai.map(n => (
                <TableRow key={n.id}>
                  <TableCell>{n.mataPelajaran.nama}</TableCell>
                  <TableCell>{n.nilai}</TableCell>
                  <TableCell>{n.catatanGuru}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <h3 className="font-semibold">Catatan Wali Kelas:</h3>
            <p>{selectedRapor.catatanWalikelas}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaporSiswaPage;
