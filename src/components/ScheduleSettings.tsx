"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";

export default function ScheduleSettings() {
  const { control, watch, setValue } = useFormContext();
  
  const platforms = watch("platforms");
  const schedule = watch("schedule");
  
  const [date, setDate] = useState<Date | undefined>(
    schedule.scheduledDate ? new Date(schedule.scheduledDate) : undefined
  );
  const [time, setTime] = useState<string>(
    schedule.scheduledDate
      ? format(new Date(schedule.scheduledDate), "HH:mm")
      : "12:00"
  );

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(newDate);
      scheduledDate.setHours(hours, minutes);
      setValue("schedule.scheduledDate", scheduledDate, { shouldValidate: true });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    if (date) {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes);
      setValue("schedule.scheduledDate", scheduledDate, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Platforms</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <FormField
              control={control}
              name="platforms.instagram"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="instagram"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="instagram" className="flex items-center gap-2 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r="1" />
                    </svg>
                    Instagram
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FormField
              control={control}
              name="platforms.facebook"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="facebook"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="facebook" className="flex items-center gap-2 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    Facebook
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FormField
              control={control}
              name="platforms.twitter"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="twitter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="twitter" className="flex items-center gap-2 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    Twitter
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">When to Post</h3>
        <RadioGroup
          defaultValue={schedule.postNow ? "now" : "later"}
          onValueChange={(value) => {
            if (value === "now") {
              setValue("schedule.postNow", true, { shouldValidate: true });
            } else {
              setValue("schedule.postNow", false, { shouldValidate: true });
              if (!schedule.scheduledDate) {
                setValue("schedule.scheduledDate", new Date(), { shouldValidate: true });
              }
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="now" id="post-now" />
            <Label htmlFor="post-now">Post immediately</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="later" id="post-later" />
            <Label htmlFor="post-later">Schedule for later</Label>
          </div>
        </RadioGroup>

        {!schedule.postNow && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex-1">
              <Label htmlFor="date" className="mb-2 block">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time" className="mb-2 block">
                Time
              </Label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 