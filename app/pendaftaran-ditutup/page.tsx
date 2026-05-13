import React from "react";
import { AlertTriangle } from "lucide-react";

const PendaftaranDitutupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Pendaftaran Saat Ini Ditutup
      </h1>
      <p className="text-gray-600">
        Mohon maaf, pendaftaran untuk karyawan baru saat ini tidak dibuka.
      </p>
      <p className="text-gray-600 mt-1">
        Silakan hubungi administrasi untuk informasi lebih lanjut.
      </p>
    </div>
  );
};

export default PendaftaranDitutupPage;
