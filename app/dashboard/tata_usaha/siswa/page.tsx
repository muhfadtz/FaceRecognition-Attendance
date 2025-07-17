"use client";

import React, { useState } from "react";
import SiswaTable from "@/components/siswa-table";
import SiswaForm from "@/components/siswa-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Karyawan } from "@prisma/client";

const ManajemenSiswaPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Karyawan | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSubmit = async (data: any) => {
    const url = selectedSiswa ? `/api/karyawan/editKaryawan` : `/api/karyawan/register`;
    const method = selectedSiswa ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: selectedSiswa?.id, status: "Siswa" }),
    });

    if (response.ok) {
      setIsDialogOpen(false);
      setRefreshKey(oldKey => oldKey + 1);
    }
  };

  const handleEdit = (siswa: Karyawan) => {
    setSelectedSiswa(siswa);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      const response = await fetch(`/api/karyawan/management`, {
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
        <h1 className="text-2xl font-bold">Manajemen Data Siswa</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedSiswa(undefined);
              setIsDialogOpen(true);
            }}>Tambah Siswa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSiswa ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
            </DialogHeader>
            <SiswaForm onSubmit={handleFormSubmit} siswa={selectedSiswa} />
          </DialogContent>
        </Dialog>
      </div>
      <SiswaTable onEdit={handleEdit} onDelete={handleDelete} refreshKey={refreshKey} />
    </div>
  );
};

export default ManajemenSiswaPage;
