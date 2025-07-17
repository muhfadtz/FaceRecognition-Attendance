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
import { JadwalPelajaran, TahunAkademik, Kelas, MataPelajaran, Karyawan } from "@prisma/client";
import JadwalPelajaranForm from "@/components/jadwal-pelajaran-form";

const ManajemenJadwalPelajaranPage = () => {
  const [jadwalPelajaran, setJadwalPelajaran] = useState<JadwalPelajaran[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalPelajaran | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data-data ini perlu di-fetch dari API
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [guruList, setGuruList] = useState<Karyawan[]>([]);

  useEffect(() => {
    // Fetch semua data yang dibutuhkan untuk form
  }, []);

  const handleFormSubmit = async (data: any) => {
    // Implementasi submit form
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Jadwal Pelajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Jadwal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedJadwal ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
            </DialogHeader>
            <JadwalPelajaranForm
              onSubmit={handleFormSubmit}
              jadwalPelajaran={selectedJadwal}
              tahunAkademikList={tahunAkademikList}
              kelasList={kelasList}
              mataPelajaranList={mataPelajaranList}
              guruList={guruList}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* Tampilkan tabel jadwal pelajaran di sini */}
    </div>
  );
};

export default ManajemenJadwalPelajaranPage;
