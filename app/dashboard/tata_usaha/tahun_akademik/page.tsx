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
import { TahunAkademik } from "@prisma/client";
import TahunAkademikForm from "@/components/tahun-akademik-form";

const ManajemenTahunAkademikPage = () => {
  const [tahunAkademik, setTahunAkademik] = useState<TahunAkademik[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState<TahunAkademik | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTahunAkademik = async () => {
      const response = await fetch("/api/tahun_akademik");
      const data = await response.json();
      setTahunAkademik(data);
    };
    fetchTahunAkademik();
  }, [refreshKey]);

  const handleFormSubmit = async (data: any) => {
    const url = selectedTahun ? `/api/tahun_akademik` : `/api/tahun_akademik`;
    const method = selectedTahun ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: selectedTahun?.id }),
    });

    if (response.ok) {
      setIsDialogOpen(false);
      setRefreshKey(oldKey => oldKey + 1);
    }
  };

  const handleEdit = (tahun: TahunAkademik) => {
    setSelectedTahun(tahun);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus tahun akademik ini?")) {
      const response = await fetch(`/api/tahun_akademik`, {
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
        <h1 className="text-2xl font-bold">Manajemen Tahun Akademik</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedTahun(undefined);
              setIsDialogOpen(true);
            }}>Tambah Tahun Akademik</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTahun ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}</DialogTitle>
            </DialogHeader>
            <TahunAkademikForm onSubmit={handleFormSubmit} tahunAkademik={selectedTahun} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tahun Ajaran</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tahunAkademik.map((ta) => (
            <TableRow key={ta.id}>
              <TableCell>{ta.tahun}</TableCell>
              <TableCell>{ta.semester}</TableCell>
              <TableCell>{ta.isActive ? "Aktif" : "Tidak Aktif"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(ta)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(ta.id)}>
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

export default ManajemenTahunAkademikPage;
