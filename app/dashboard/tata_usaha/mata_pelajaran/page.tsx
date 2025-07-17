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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MataPelajaran } from "@prisma/client";
import MataPelajaranForm from "@/components/mata-pelajaran-form";

const ManajemenMataPelajaranPage = () => {
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<MataPelajaran | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMataPelajaran = async () => {
      const response = await fetch("/api/mata_pelajaran");
      const data = await response.json();
      setMataPelajaran(data);
    };
    fetchMataPelajaran();
  }, [refreshKey]);

  const handleFormSubmit = async (data: any) => {
    const url = selectedMataPelajaran ? `/api/mata_pelajaran` : `/api/mata_pelajaran`;
    const method = selectedMataPelajaran ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: selectedMataPelajaran?.id }),
    });

    if (response.ok) {
      setIsDialogOpen(false);
      setRefreshKey(oldKey => oldKey + 1);
    }
  };

  const handleEdit = (mp: MataPelajaran) => {
    setSelectedMataPelajaran(mp);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) {
      const response = await fetch(`/api/mata_pelajaran`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setRefreshKey(oldKey => oldKey + 1);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Mata Pelajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedMataPelajaran(undefined);
              setIsDialogOpen(true);
            }}>Tambah Mata Pelajaran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMataPelajaran ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
            </DialogHeader>
            <MataPelajaranForm onSubmit={handleFormSubmit} mataPelajaran={selectedMataPelajaran} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mataPelajaran.map((mp) => (
            <TableRow key={mp.id}>
              <TableCell>{mp.nama}</TableCell>
              <TableCell>{mp.deskripsi}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(mp)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(mp.id)}>
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

export default ManajemenMataPelajaranPage;
