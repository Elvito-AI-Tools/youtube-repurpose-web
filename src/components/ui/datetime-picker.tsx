"use client";

import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  disabled?: boolean;
}

export function DateTimePicker({
  selected,
  onChange,
  className,
  placeholder = "Select date and time",
  showTimeSelect = true,
  dateFormat = "MMM d, yyyy h:mm aa",
  minDate = new Date(),
  disabled = false,
}: DateTimePickerProps) {
  // Custom input component
  const CustomInput = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          "text-foreground",
          className
        )}
        onClick={disabled ? undefined : onClick}
        ref={ref}
      >
        <span className={cn(value ? "text-foreground" : "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 opacity-50" />
      </div>
    )
  );

  CustomInput.displayName = "CustomDateTimePickerInput";

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      customInput={<CustomInput />}
      showTimeSelect={showTimeSelect}
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat={dateFormat}
      minDate={minDate}
      disabled={disabled}
      popperClassName="z-50"
      calendarClassName="bg-background border border-input shadow-lg rounded-md"
      wrapperClassName="w-full"
      timeCaption="Time"
    />
  );
} 