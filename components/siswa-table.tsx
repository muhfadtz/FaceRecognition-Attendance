"use client";

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
import { Karyawan } from "@prisma/client";

interface SiswaTableProps {
  onEdit: (siswa: Karyawan) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

const SiswaTable: React.FC<SiswaTableProps> = ({ onEdit, onDelete, refreshKey }) => {
  const [siswa, setSiswa] = useState<Karyawan[]>([]);

  useEffect(() => {
    const fetchSiswa = async () => {
      const response = await fetch("/api/karyawan?role=Siswa");
      const data = await response.json();
      setSiswa(data);
    };
    fetchSiswa();
  }, [refreshKey]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siswa.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.nama}</TableCell>
              <TableCell>{s.nip}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => onEdit(s)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>
                  Hapus
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SiswaTable;
