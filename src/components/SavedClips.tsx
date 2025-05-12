"use client";

import { useState, useEffect } from "react";
import { SavedClip } from "@/app/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Download, Save } from "lucide-react";
import { VideoPlayer } from "./video/VideoPlayer";
import { VideoSettings } from "./video/VideoSettings";
import { ClipSettings } from "./video/types";
import { formatTime } from "./video/utils";
import { toast } from "sonner";

interface SavedClipsProps {
  clips: SavedClip[];
  onRemoveClip: (id: string) => void;
}

export default function SavedClips({ clips, onRemoveClip }: SavedClipsProps) {
  const [mounted, setMounted] = useState(false);
  const [clipSettings, setClipSettings] = useState<Record<string, ClipSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Only initialize on the client side
  useEffect(() => {
    setMounted(true);
    
    // Initialize settings for all clips
    const initialSettings: Record<string, ClipSettings> = {};
    clips.forEach(clip => {
      initialSettings[clip.id] = getDefaultSettings();
    });
    setClipSettings(initialSettings);
  }, []);

  const getDefaultSettings = (): ClipSettings => ({
    aspectRatio: "original",
    xPosition: 50,
    yPosition: 50,
    zoomLevel: 100,
    isPlaying: false,
    currentTime: 0,
  });

  const getSettings = (clipId: string): ClipSettings => {
    return clipSettings[clipId] || getDefaultSettings();
  };

  const updateSettings = (clipId: string, updates: Partial<ClipSettings>) => {
    setClipSettings(prev => ({
      ...prev,
      [clipId]: {
        ...getSettings(clipId),
        ...updates,
      },
    }));
  };

  const handleAspectRatioChange = (clipId: string, ratio: ClipSettings['aspectRatio']) => {
    updateSettings(clipId, { 
      aspectRatio: ratio,
      xPosition: 50,
      yPosition: 50,
      zoomLevel: 100
    });
  };

  // New function to save all clips to the webhook
  const saveAllClips = async () => {
    if (clips.length === 0) {
      toast.error("No clips to save");
      return;
    }

    setIsSaving(true);
    try {
      // Create an array of clip data with their settings
      const clipsData = clips.map(clip => ({
        start: clip.start,
        end: clip.end,
        aspectRatio: getSettings(clip.id).aspectRatio,
        youtubeURL: clip.originalUrl,
        videoId: clip.videoId,
        title: clip.title
      }));

      // Call the webhook with all clips data
      const response = await fetch("http://127.0.0.1:5678/webhook-test/3aa575e6-5c42-46df-9bd3-505c724c12ff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clips: clipsData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save clips');
      }

      toast.success("All clips saved successfully", {
        description: `${clips.length} clips have been saved.`
      });
    } catch (error) {
      console.error('Error saving clips:', error);
      toast.error("Failed to save clips", {
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">My Clips</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You haven't saved any clips yet. Go to the YouTube Clipper tab to create and save clips.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Clips</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize and preview your saved clips.
          </p>
        </div>
        <Button
          className="bg-[#97D700] text-[#121212] hover:bg-[#85bd00]"
          onClick={saveAllClips}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : `Save All Clips (${clips.length})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {clips.map((clip) => {
          const settings = getSettings(clip.id);

          return (
            <Card key={clip.id} className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333333]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{clip.title}</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  {formatTime(clip.start)} - {formatTime(clip.end)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex flex-col gap-6">
                  {mounted && (
                    <>
                      <VideoPlayer 
                        clip={clip} 
                        settings={settings}
                        onSettingsChange={(updates) => updateSettings(clip.id, updates)}
                      />

                      <VideoSettings
                        clipId={clip.id}
                        settings={settings}
                        onAspectRatioChange={(ratio) => handleAspectRatioChange(clip.id, ratio)}
                      />
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={() => onRemoveClip(clip.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 