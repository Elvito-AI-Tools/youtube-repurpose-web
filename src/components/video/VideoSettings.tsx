"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipSettings } from "./types";

interface VideoSettingsProps {
  clipId: string;
  settings: ClipSettings;
  onAspectRatioChange: (ratio: ClipSettings['aspectRatio']) => void;
  // Keep these props in the interface even though we won't use them
  // to maintain compatibility with calling code
  onZoomChange?: (value: number) => void;
  onPositionChange?: (axis: 'x' | 'y', value: number) => void;
}

export function VideoSettings({ 
  clipId, 
  settings, 
  onAspectRatioChange,
}: VideoSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Aspect Ratio Control - Only control we're keeping */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Aspect Ratio
        </label>
        <Select
          value={settings.aspectRatio}
          onValueChange={(value: ClipSettings['aspectRatio']) => onAspectRatioChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
            <SelectItem value="original">Original</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Removed Zoom Control */}
      
      {/* Removed Position Controls */}
    </div>
  );
} 