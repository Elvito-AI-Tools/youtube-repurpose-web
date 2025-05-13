"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Volume2, Maximize2 } from "lucide-react";
import { SavedClip } from "@/app/page";
import { ClipSettings } from "./types";
import { formatTime } from "./utils";
import { VideoControls } from "./VideoControls";

interface VideoPlayerProps {
  clip: SavedClip;
  settings: ClipSettings;
  onSettingsChange: (updates: Partial<ClipSettings>) => void;
}

export function VideoPlayer({ clip, settings, onSettingsChange }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [apiReady, setApiReady] = useState(false);
  const timeUpdateRef = useRef<number | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(clip.start);
  const [mounted, setMounted] = useState(false);
  
  // Use a ref to check if we're currently handling seeking to avoid circular updates
  const isSeeking = useRef(false);
  
  // Extract playback settings to separate object
  const playbackSettings = {
    isPlaying: settings.isPlaying,
    currentTime: settings.currentTime
  };
  
  // Extract appearance settings to separate object with fixed values
  const appearanceSettings = {
    aspectRatio: settings.aspectRatio,
    xPosition: 50, // Fixed center position
    yPosition: 50, // Fixed center position
    zoomLevel: 100  // Fixed default zoom (100%)
  };

  // Only initialize on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if API is already loaded
    if (window.YT) {
      setApiReady(true);
      initializePlayer();
      return;
    }

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Define the callback
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
      initializePlayer();
    };

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }
    };
  }, [clip.id, mounted]);

  // Re-initialize player when clip changes
  useEffect(() => {
    if (apiReady && mounted) {
      initializePlayer();
    }
  }, [clip.videoId, clip.start, clip.end, mounted]);

  // Handle time updates
  useEffect(() => {
    let frameId: number | null = null;

    const updateTime = () => {
      if (!playerRef.current || !playerReady || isSeeking.current) return;

      try {
        const time = playerRef.current.getCurrentTime();
        if (!isNaN(time)) {
          setPlayerCurrentTime(time);
          
          // Only update the settings time if it's significantly different (to reduce updates)
          if (Math.abs(time - playbackSettings.currentTime) > 0.5) {
            // Only update currentTime, not aspectRatio
            onSettingsChange({
              currentTime: time,
            });
          }
        }

        if (time >= clip.end) {
          // Directly apply the reset logic here to avoid dependency issues
          playerRef.current.seekTo(clip.start, true);
          playerRef.current.pauseVideo();
          setPlayerCurrentTime(clip.start);
          onSettingsChange({ 
            isPlaying: false, 
            currentTime: clip.start,
          });
          return;
        }

        if (playbackSettings.isPlaying) {
          frameId = requestAnimationFrame(updateTime);
        }
      } catch (e) {
        console.error("Error updating time:", e);
      }
    };

    if (playbackSettings.isPlaying && playerReady) {
      frameId = requestAnimationFrame(updateTime);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [playbackSettings.isPlaying, playerReady, clip.end, clip.start, settings]);

  const initializePlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying player:", e);
      }
      playerRef.current = null;
    }

    const container = document.getElementById(`player-${clip.id}`);
    if (!container) return;

    playerRef.current = new window.YT.Player(`player-${clip.id}`, {
      videoId: clip.videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        autoplay: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: () => {
          setPlayerReady(true);
          const iframe = playerRef.current.getIframe();
          if (iframe) {
            iframe.style.opacity = '1';
          }
          // Seek to start time when player is ready
          playerRef.current.seekTo(clip.start, true);
          setPlayerCurrentTime(clip.start);
          // Remove settings initialization as it may override existing settings
        },
        onStateChange: (event: any) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          // Preserve all current settings when updating play state
          onSettingsChange({
            ...settings,
            isPlaying,
          });
        },
      },
    });
  };

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    
    const newIsPlaying = !playbackSettings.isPlaying;
    
    if (newIsPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
    
    // Only update isPlaying, not aspectRatio
    onSettingsChange({ 
      isPlaying: newIsPlaying,
    });
  }, [playerReady, playbackSettings.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (!playerRef.current || !playerReady) return;
    
    isSeeking.current = true;
    playerRef.current.seekTo(time, true);
    setPlayerCurrentTime(time);
    
    // Only update currentTime, not aspectRatio
    onSettingsChange({
      currentTime: time,
    });
    
    // Reset the seeking flag after a short delay
    setTimeout(() => {
      isSeeking.current = false;
    }, 100);
  }, [playerReady]);

  const handleReset = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    
    isSeeking.current = true;
    playerRef.current.seekTo(clip.start, true);
    playerRef.current.pauseVideo();
    setPlayerCurrentTime(clip.start);
    
    // Only update isPlaying and currentTime, not aspectRatio
    onSettingsChange({ 
      isPlaying: false, 
      currentTime: clip.start,
    });
    
    // Reset the seeking flag after a short delay
    setTimeout(() => {
      isSeeking.current = false;
    }, 100);
  }, [clip.start, playerReady]);

  // Calculate progress with safety checks
  const duration = Math.max(0.1, clip.end - clip.start);
  const clampedTime = Math.max(clip.start, Math.min(clip.end, playerCurrentTime));
  const progress = Math.max(0, Math.min(100, ((clampedTime - clip.start) / duration) * 100));
  
  const formattedCurrentTime = formatTime(clampedTime);
  const formattedEndTime = formatTime(clip.end);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="relative bg-black rounded-lg overflow-hidden"
            style={{
              maxWidth: "400px",
              width: "100%",
              margin: "0 auto",
              aspectRatio: settings.aspectRatio === "9:16" ? "9/16" :
                settings.aspectRatio === "4:5" ? "4/5" :
                settings.aspectRatio === "1:1" ? "1/1" : "16/9",
            }}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video Preview Container */}
      <div className="relative">
        <div className="relative bg-black rounded-lg overflow-hidden"
          style={{
            maxWidth: "400px",
            width: "100%",
            margin: "0 auto",
            aspectRatio: settings.aspectRatio === "9:16" ? "9/16" :
              settings.aspectRatio === "4:5" ? "4/5" :
              settings.aspectRatio === "1:1" ? "1/1" : "16/9",
          }}>
          <div
            className="relative w-full h-full"
            style={{
              // Use fixed center position with no zoom
              transform: `translate(0%, 0%) scale(1)`,
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div
              id={`player-${clip.id}`}
              className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300"
            />
            {!apiReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <VideoControls
        isPlaying={settings.isPlaying}
        currentTime={playerCurrentTime}
        startTime={clip.start}
        endTime={clip.end}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSeek={handleSeek}
      />
    </div>
  );
} 