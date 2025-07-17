"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JadwalPelajaran, TahunAkademik, Kelas, MataPelajaran, Karyawan } from "@prisma/client";

const formSchema = z.object({
  tahunAkademikId: z.number(),
  kelasId: z.number(),
  mataPelajaranId: z.number(),
  guruId: z.number(),
  hari: z.string(),
  waktuMulai: z.string(),
  waktuSelesai: z.string(),
});

interface JadwalPelajaranFormProps {
  jadwalPelajaran?: JadwalPelajaran;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  tahunAkademikList: TahunAkademik[];
  kelasList: Kelas[];
  mataPelajaranList: MataPelajaran[];
  guruList: Karyawan[];
}

const JadwalPelajaranForm: React.FC<JadwalPelajaranFormProps> = ({
  jadwalPelajaran,
  onSubmit,
  tahunAkademikList,
  kelasList,
  mataPelajaranList,
  guruList,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tahunAkademikId: jadwalPelajaran?.tahunAkademikId,
      kelasId: jadwalPelajaran?.kelasId,
      mataPelajaranId: jadwalPelajaran?.mataPelajaranId,
      guruId: jadwalPelajaran?.guruId,
      hari: jadwalPelajaran?.hari || "",
      waktuMulai: jadwalPelajaran?.waktuMulai || "",
      waktuSelesai: jadwalPelajaran?.waktuSelesai || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Select fields for tahunAkademik, kelas, mataPelajaran, guru */}
        <FormField
          control={form.control}
          name="hari"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hari</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Senin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="waktuMulai"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waktu Mulai</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="waktuSelesai"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waktu Selesai</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Simpan</Button>
      </form>
    </Form>
  );
};

export default JadwalPelajaranForm;
