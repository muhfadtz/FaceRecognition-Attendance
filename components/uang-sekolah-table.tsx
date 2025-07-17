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
import { Karyawan, UangSekolah } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type SiswaWithUangSekolah = Karyawan & {
  uangSekolah: UangSekolah[];
};

const UangSekolahTable = () => {
  const [siswa, setSiswa] = useState<SiswaWithUangSekolah[]>([]);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchSiswa = async () => {
      const response = await fetch(`/api/uang_sekolah?bulan=${bulan}&tahun=${tahun}`);
      const data = await response.json();
      setSiswa(data);
    };
    fetchSiswa();
  }, [bulan, tahun]);

  const handleSetLunas = async (siswaId: number) => {
    const response = await fetch("/api/uang_sekolah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            siswaId,
            bulan,
            tahun,
            jumlah: 100000, // Contoh jumlah
        }),
    });

    if (response.ok) {
        // Refresh data
        const fetchSiswa = async () => {
            const response = await fetch(`/api/uang_sekolah?bulan=${bulan}&tahun=${tahun}`);
            const data = await response.json();
            setSiswa(data);
        };
        fetchSiswa();
    }
  };

  return (
    <div>
      {/* Tambahkan filter bulan dan tahun di sini */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Status Pembayaran</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siswa.map((s) => {
            const pembayaranBulanIni = s.uangSekolah.find(p => p.bulan === bulan && p.tahun === tahun);
            const status = pembayaranBulanIni?.status || "Belum Lunas";
            return (
              <TableRow key={s.id}>
                <TableCell>{s.nama}</TableCell>
                <TableCell>
                  <Badge variant={status === "Lunas" ? "default" : "destructive"}>
                    {status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {status === "Belum Lunas" && (
                    <Button size="sm" onClick={() => handleSetLunas(s.id)}>
                      Set Lunas
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UangSekolahTable;
