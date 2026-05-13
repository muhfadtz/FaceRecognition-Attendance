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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TahunAkademik } from "@prisma/client";

const formSchema = z.object({
  tahun: z.string().min(1, "Tahun harus diisi"),
  semester: z.string().min(1, "Semester harus diisi"),
  isActive: z.boolean(),
});

interface TahunAkademikFormProps {
  tahunAkademik?: TahunAkademik;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const TahunAkademikForm: React.FC<TahunAkademikFormProps> = ({ tahunAkademik, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tahun: tahunAkademik?.tahun || "",
      semester: tahunAkademik?.semester || "",
      isActive: tahunAkademik?.isActive || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tahun"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahun Ajaran</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2024/2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ganjil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Aktif</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Simpan</Button>
      </form>
    </Form>
  );
};

export default TahunAkademikForm;
