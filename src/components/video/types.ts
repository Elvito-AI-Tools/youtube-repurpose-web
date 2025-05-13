import { SavedClip } from "@/app/page";

export interface ClipSettings {
  aspectRatio: "9:16" | "1:1" | "4:5" | "16:9" | "original";
  xPosition: number;
  yPosition: number;
  zoomLevel: number;
  isPlaying: boolean;
  currentTime: number;
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLDivElement,
        options: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            disablekb?: number;
            enablejsapi?: number;
            modestbranding?: number;
            rel?: number;
            showinfo?: number;
            iv_load_policy?: number;
            playsinline?: number;
            mute?: number;
            start?: number;
          };
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
          };
        }
      ) => {
        destroy: () => void;
        getCurrentTime: () => number;
        getDuration: () => number;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        getIframe: () => HTMLIFrameElement;
      };
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
} 