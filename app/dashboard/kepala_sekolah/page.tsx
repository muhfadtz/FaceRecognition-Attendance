"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const KepalaSekolahDashboard = () => {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalGuru: 0,
    kehadiranHariIni: 0,
    pembayaranLunasBulanIni: 0,
  });

  useEffect(() => {
    // Fetch data statistik dari API
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Kepala Sekolah</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSiswa}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Guru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuru}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kehadiranHariIni}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SPP Lunas Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pembayaranLunasBulanIni}%</div>
          </CardContent>
        </Card>
      </div>
      {/* Di sini bisa ditambahkan chart atau laporan lainnya */}
    </div>
  );
};

export default KepalaSekolahDashboard;
