"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const PendaftaranSettings = () => {
  const [isAktif, setIsAktif] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/pengaturan/pendaftaran");
        const data = await response.json();
        if (response.ok) {
          setIsAktif(data.isAktif);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleChange = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pengaturan/pendaftaran", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAktif: checked }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAktif(data.isAktif);
        toast({
          title: "Pengaturan Berhasil Disimpan",
          description: `Pendaftaran publik telah ${data.isAktif ? "diaktifkan" : "dinonaktifkan"}.`,
        });
      } else {
        throw new Error("Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
      // Revert a state change on error
      setIsAktif(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
        Pengaturan Pendaftaran Karyawan Publik
      </h4>
      <div className="flex items-center space-x-2">
        <Switch
          id="pendaftaran-toggle"
          checked={isAktif}
          onCheckedChange={handleToggleChange}
          disabled={isLoading}
        />
        <Label htmlFor="pendaftaran-toggle">
          {isLoading ? "Memuat..." : (isAktif ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup")}
        </Label>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Jika aktif, halaman pendaftaran publik akan dapat diakses. Jika tidak aktif, pengunjung akan dialihkan.
      </p>
    </div>
  );
};

export default PendaftaranSettings;
