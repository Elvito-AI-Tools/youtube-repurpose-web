"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/ImageUploader";
import CaptionEditor from "@/components/CaptionEditor";
import ScheduleSettings from "@/components/ScheduleSettings";
import { postToInstagram } from "@/actions/instagram";
import { toast } from "sonner";

const formSchema = z.object({
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),
  caption: z.string().min(1, "Caption is required"),
  platforms: z.object({
    instagram: z.boolean(),
    facebook: z.boolean(),
    twitter: z.boolean(),
  }),
  schedule: z.object({
    postNow: z.boolean(),
    scheduledDate: z.date().nullable(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SocialMediaAgent() {
  const [currentStep, setCurrentStep] = useState<"content" | "schedule">("content");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      caption: "",
      platforms: {
        instagram: true,
        facebook: true,
        twitter: true,
      },
      schedule: {
        postNow: true,
        scheduledDate: null,
      },
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, reset, formState } = methods;
  const { isValid } = formState;
  
  const watchImages = watch("images");
  const watchCaption = watch("caption");
  const watchPlatforms = watch("platforms");
  const watchSchedule = watch("schedule");
  
  const canProceedToSchedule = watchImages.length > 0 && watchCaption.trim() !== "";
  const canSubmit = isValid && (watchPlatforms.instagram || watchPlatforms.facebook || watchPlatforms.twitter);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if at least one platform is selected
      if (!data.platforms.instagram && !data.platforms.facebook && !data.platforms.twitter) {
        toast.error("Please select at least one platform to post to");
        return;
      }
      
      // Post to Instagram if selected
      if (data.platforms.instagram) {
        const result = await postToInstagram(data);
        if (result.success) {
          toast.success(`Instagram: ${result.message}`);
        } else {
          toast.error(`Instagram: ${result.message}`);
        }
      }
      
      // Here you would add similar logic for Facebook and Twitter
      
      // Reset form after successful submission
      reset();
      setCurrentStep("content");
      
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("Failed to submit post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="w-full">
        <CardContent className="p-6">
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as "content" | "schedule")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="schedule" disabled={!canProceedToSchedule}>
                Schedule
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Create Your Post</h2>
              <ImageUploader name="images" />
              <CaptionEditor name="caption" />
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setCurrentStep("schedule")} 
                  disabled={!canProceedToSchedule}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Your Post</h2>
              <ScheduleSettings />
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("content")}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={isSubmitting || !canSubmit}
                >
                  {isSubmitting ? "Submitting..." : watchSchedule.postNow ? "Post Now" : "Schedule Post"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </FormProvider>
  );
} 