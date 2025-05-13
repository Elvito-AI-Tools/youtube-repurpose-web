"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "./ui/input";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SavedClip } from "@/app/page";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { formatTime } from "./video/utils";
import { DateTimePicker } from "./ui/datetime-picker";

const formSchema = z.object({
  youtubeUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .refine(
      (url) => {
        // Basic validation for YouTube URLs
        return (
          url.includes("youtube.com/watch") ||
          url.includes("youtu.be/")
        );
      },
      { message: "Please enter a valid YouTube URL" }
    ),
});

interface Clip {
  start: number;
  end: number;
  title: string;
  script: string;
}

interface YouTubeClipperProps {
  onVideoLoad: () => void;
  onSaveClip?: (clip: SavedClip) => void;
}

export default function YouTubeClipper({ onVideoLoad, onSaveClip }: YouTubeClipperProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(60);
  const [originalUrl, setOriginalUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [suggestedClips, setSuggestedClips] = useState<Clip[]>([]);
  const [isLoadingClips, setIsLoadingClips] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [clipTitle, setClipTitle] = useState("");
  const [clipCaption, setClipCaption] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const id = extractVideoId(values.youtubeUrl);
    if (id) {
      setVideoId(id);
      setStartTime(0);
      setEndTime(60);
      setOriginalUrl(values.youtubeUrl);
      setSuggestedClips([]);
      onVideoLoad();
    }
  }

  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (window.YT) return;
    
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Define the callback function that the YouTube API will call
    window.onYouTubeIframeAPIReady = () => {
      // The API is ready, but we don't create the player until we have a videoId
    };

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize player when videoId changes
  useEffect(() => {
    if (!videoId || !window.YT) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const onPlayerReady = (event: any) => {
      const dur = event.target.getDuration();
      setDuration(dur);
      setEndTime(Math.min(60, dur));
    };

    const onPlayerStateChange = (event: any) => {
      setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    };

    // Ensure the container element exists before creating the player
    if (playerContainerRef.current) {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Update current time for the timeline indicator
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
      
      if (time >= endTime) {
        playerRef.current.seekTo(startTime, true);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [startTime, endTime, isPlaying]);

  const playSelectedSegment = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
    }
  };

  // Handle range slider changes
  const handleRangeChange = (values: number[]) => {
    setStartTime(values[0]);
    setEndTime(values[1]);
  };

  // Generate timeline markers
  const generateTimelineMarkers = () => {
    if (!duration) return null;
    
    const markers = [];
    const interval = Math.max(Math.floor(duration / 10), 30); // Show markers every 30 seconds or 1/10th of video
    
    for (let i = 0; i <= duration; i += interval) {
      const position = (i / duration) * 100;
      markers.push(
        <div 
          key={i} 
          className="absolute h-3 border-l border-gray-400" 
          style={{ left: `${position}%` }}
        >
          <span className="text-xs text-gray-500 absolute -left-4 top-3">{formatTime(i)}</span>
        </div>
      );
    }
    
    return markers;
  };

  // Generate clip URL with timestamps
  const generateClipUrl = () => {
    if (!videoId) return "";
    
    // Start with base YouTube URL
    let clipUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Add start time parameter (in seconds)
    clipUrl += `&start=${Math.floor(startTime)}`;
    
    // Add end time parameter (in seconds)
    clipUrl += `&end=${Math.floor(endTime)}`;
    
    return clipUrl;
  };
  
  // Handle copying clip URL to clipboard
  const copyClipUrl = async () => {
    const clipUrl = generateClipUrl();
    
    try {
      await navigator.clipboard.writeText(clipUrl);
      setCopySuccess(true);
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL to clipboard", err);
    }
  };

  const fetchSuggestedClips = async () => {
    if (!videoId) return;
    
    setIsLoadingClips(true);
    try {
      // Here you would implement your own logic to find best clips
      // For now, we'll just show a message
      toast.info("This feature is not implemented yet");
      setIsLoadingClips(false);
    } catch (error) {
      console.error('Error finding clips:', error);
      toast.error("Failed to find clips");
      setIsLoadingClips(false);
    }
  };

  const saveCurrentClip = () => {
    if (!videoId || !onSaveClip) return;
    
    // Create a new saved clip object
    const newClip: SavedClip = {
      id: uuidv4(),
      videoId,
      title: clipTitle || `Clip ${formatTime(startTime)}-${formatTime(endTime)}`,
      start: startTime,
      end: endTime,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      originalUrl,
      createdAt: new Date(),
      caption: clipCaption,
    };
    
    // Call the parent's onSaveClip function
    onSaveClip(newClip);
    
    // Show success toast
    toast.success("Clip saved successfully!", {
      description: `Your clip "${newClip.title}" has been added to My Clips.`,
    });
    
    // Reset the clip title, caption and schedule time
    setClipTitle("");
    setClipCaption("");
  };
  
  // Add back the selectClip function
  const selectClip = (clip: Clip) => {
    setStartTime(clip.start);
    setEndTime(clip.end);
    setClipDuration(clip.end - clip.start);
  };
  
  // Add back the renderClipMarkers function
  const renderClipMarkers = () => {
    if (!duration || !suggestedClips.length) return null;

    return suggestedClips.map((clip, index) => {
      const startPosition = (clip.start / duration) * 100;
      const endPosition = (clip.end / duration) * 100;
      const width = endPosition - startPosition;

      return (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => selectClip(clip)}
                className="absolute h-2 bg-[#97D700] hover:bg-[#85bd00] rounded-sm cursor-pointer -mt-3"
                style={{
                  left: `${startPosition}%`,
                  width: `${width}%`,
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{clip.title}</p>
              <p className="text-sm text-gray-400">{clip.script}</p>
              <p className="text-xs mt-1">
                {formatTime(clip.start)} - {formatTime(clip.end)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  return (
    <div className="rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">YouTube URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#333333] text-black dark:text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="yt-clipper-button w-full">
            Load Video
          </Button>
        </form>
      </Form>

      {videoId && (
        <div className="mt-8 space-y-6">
          <div className="bg-gray-100 dark:bg-[#252525] rounded-lg p-4">
            <div className="relative aspect-video">
              <div ref={playerContainerRef} className="absolute inset-0 rounded-md overflow-hidden w-full h-full" />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#252525] rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Clip Segment</h3>
              <Button
                onClick={fetchSuggestedClips}
                disabled={isLoadingClips}
                className="yt-clipper-button"
              >
                {isLoadingClips ? "Finding Best Clips..." : "Find Best Clips"}
              </Button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Start: {formatTime(startTime)}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">End: {formatTime(endTime)}</span>
              </div>
              <div className="slider-track relative">
                <RangeSlider
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={[startTime, endTime]}
                  onInput={([start, end]) => {
                    setStartTime(start);
                    setEndTime(end);
                    setClipDuration(end - start);
                  }}
                />
                {renderClipMarkers()}
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>00:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clip Duration</p>
                <p className="font-semibold text-black dark:text-white">{formatTime(clipDuration)}</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={playSelectedSegment} 
                  className="yt-clipper-button"
                >
                  Play Segment
                </Button>
              </div>
            </div>
          </div>

          {suggestedClips.length > 0 && (
            <div className="bg-gray-100 dark:bg-[#252525] rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Suggested Clips</h3>
              <div className="space-y-3">
                {suggestedClips.map((clip, index) => (
                  <div
                    key={index}
                    onClick={() => selectClip(clip)}
                    className="p-3 bg-white dark:bg-[#1E1E1E] rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                  >
                    <h4 className="font-semibold text-black dark:text-white">{clip.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{clip.script}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Duration: {formatTime(clip.end - clip.start)} ({formatTime(clip.start)} - {formatTime(clip.end)})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-100 dark:bg-[#252525] rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Save This Clip</h3>
            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                  Clip Title
                </label>
                <Input
                  value={clipTitle}
                  onChange={(e) => setClipTitle(e.target.value)}
                  placeholder="Enter a title for this clip"
                  className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#333333] text-black dark:text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                  Caption
                </label>
                <Input
                  value={clipCaption}
                  onChange={(e) => setClipCaption(e.target.value)}
                  placeholder="Add a caption for this clip"
                  className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#333333] text-black dark:text-white"
                />
              </div>
              
              <Button 
                onClick={saveCurrentClip} 
                className="yt-clipper-button w-full"
              >
                Save to My Clips
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#252525] rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Generate Clip Link</h3>
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={generateClipUrl} 
                className="yt-clipper-button"
              >
                Generate Clip URL
              </Button>
              
              {originalUrl && startTime !== undefined && endTime !== undefined && (
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <Input
                      value={`${originalUrl}&t=${Math.floor(startTime)}s&end=${Math.floor(endTime)}`}
                      readOnly
                      className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#333333] text-black dark:text-white flex-1"
                    />
                    <Button 
                      onClick={copyClipUrl} 
                      className="yt-clipper-button whitespace-nowrap"
                    >
                      {copySuccess ? "Copied!" : "Copy URL"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 