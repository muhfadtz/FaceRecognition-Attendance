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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Karyawan, Kelas, MataPelajaran } from "@prisma/client";

const IsiNilaiPage = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<string>("");
  const [siswaList, setSiswaList] = useState<Karyawan[]>([]);
  const [nilai, setNilai] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    // Fetch kelas dan mata pelajaran yang diajar oleh guru
  }, []);

  useEffect(() => {
    // Fetch siswa berdasarkan kelas yang dipilih
  }, [selectedKelas]);

  const handleNilaiChange = (siswaId: number, nilai: number) => {
    setNilai(prev => ({ ...prev, [siswaId]: nilai }));
  };

  const handleSubmit = async () => {
    // Implementasi untuk menyimpan nilai
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Isi Nilai Rapor</h1>
      <div className="flex gap-4 mb-4">
        {/* Select untuk kelas dan mata pelajaran */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Nilai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siswaList.map(siswa => (
            <TableRow key={siswa.id}>
              <TableCell>{siswa.nama}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={nilai[siswa.id] || ""}
                  onChange={(e) => handleNilaiChange(siswa.id, parseInt(e.target.value))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSubmit} className="mt-4">Simpan Nilai</Button>
    </div>
  );
};

export default IsiNilaiPage;
