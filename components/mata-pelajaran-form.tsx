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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MataPelajaran } from "@prisma/client";

const formSchema = z.object({
  nama: z.string().min(1, "Nama mata pelajaran harus diisi"),
  deskripsi: z.string().optional(),
});

interface MataPelajaranFormProps {
  mataPelajaran?: MataPelajaran;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const MataPelajaranForm: React.FC<MataPelajaranFormProps> = ({ mataPelajaran, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: mataPelajaran?.nama || "",
      deskripsi: mataPelajaran?.deskripsi || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Matematika" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat mata pelajaran" {...field} />
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

export default MataPelajaranForm;
