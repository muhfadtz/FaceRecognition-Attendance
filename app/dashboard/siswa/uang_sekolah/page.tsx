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
import { Badge } from "@/components/ui/badge";
import { UangSekolah } from "@prisma/client";

const UangSekolahSiswaPage = () => {
  const [pembayaran, setPembayaran] = useState<UangSekolah[]>([]);

  useEffect(() => {
    // Fetch data uang sekolah untuk siswa yang sedang login
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Status Pembayaran Uang Sekolah</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bulan</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Bayar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pembayaran.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.bulan}</TableCell>
              <TableCell>{p.tahun}</TableCell>
              <TableCell>Rp {p.jumlah.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={p.status === "Lunas" ? "default" : "destructive"}>
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell>
                {p.tanggalBayar ? new Date(p.tanggalBayar).toLocaleDateString() : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UangSekolahSiswaPage;
