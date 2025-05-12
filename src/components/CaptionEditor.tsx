"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

interface CaptionEditorProps {
  name: string;
}

export default function CaptionEditor({ name }: CaptionEditorProps) {
  const { control, watch } = useFormContext();
  const value = watch(name) || "";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <Label htmlFor={name}>Caption</Label>
          <FormControl>
            <Textarea
              id={name}
              placeholder="Describe your car listing... Include details like make, model, year, price, and key features."
              className="min-h-[150px]"
              {...field}
            />
          </FormControl>
          <p className="text-xs text-gray-500">
            {value.length}/2200 characters (Instagram limit)
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 