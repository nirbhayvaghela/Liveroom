
import React from "react";
import { X, Image, FileIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  file: File
}

interface MediaPreviewProps {
  files: MediaFile[];
  onRemove: (id: string) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ files, onRemove }) => {
  if (!files.length) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-6 w-6" />;
    } else if (type.startsWith("video/")) {
      return <Film className="h-6 w-6" />;
    } else {
      return <FileIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="p-2 animate-fade-in">
      <div className="flex flex-wrap gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative rounded-md border border-border bg-card p-1 transition-all hover:shadow-md"
          >
            {file.type.startsWith("image/") ? (
              <div className="relative h-20 w-20 overflow-hidden rounded">
                <img
                  src={file.thumbnailUrl || file.url}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded bg-muted">
                {getFileIcon(file.type)}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background opacity-0 shadow-sm transition-all group-hover:opacity-100"
              onClick={() => onRemove(file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="mt-1 w-20 truncate text-center text-xs text-muted-foreground">
              {file.name.length > 15
                ? `${file.name.substring(0, 12)}...`
                : file.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;
