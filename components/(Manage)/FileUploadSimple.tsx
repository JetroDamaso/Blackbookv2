import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { Input } from "react-aria-components";
import { File, FileAudio, FileIcon, FileImage, FileText, FileVideo, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

type FileWithPreview = {
  id: string;
  file: File;
};

type FileUploadSimpleProps = {
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  resetTrigger?: number;
  onAddClick?: () => void; // Exposed to parent for custom button
};

const FileUploadSimpleComponent = ({
  onFilesChange,
  disabled = false,
  resetTrigger = 0,
  onAddClick,
}: FileUploadSimpleProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use ref to store the callback to avoid it being a dependency
  const onFilesChangeRef = useRef(onFilesChange);

  // Update ref when callback changes
  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  // Reset files when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setFiles([]);
      if (onFilesChangeRef.current) {
        onFilesChangeRef.current([]);
      }
    }
  }, [resetTrigger]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      id: `${Date.now()}-${file.name}`,
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);

    if (onFilesChangeRef.current) {
      onFilesChangeRef.current(updatedFiles.map(f => f.file));
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeFile(id: string) {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);

    if (onFilesChangeRef.current) {
      onFilesChangeRef.current(updatedFiles.map(f => f.file));
    }
  }

  // Expose click handler to parent
  useEffect(() => {
    if (onAddClick && inputRef.current) {
      const handleClick = () => inputRef.current?.click();
      // Store reference for cleanup
      const currentRef = inputRef.current;
      return () => {
        // Cleanup if needed
      };
    }
  }, [onAddClick]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
        id="fileUploadSimple"
        disabled={disabled}
      />

      <FileList files={files} onRemove={removeFile} disabled={disabled} />
    </div>
  );
};

export const FileUploadSimple = React.memo(FileUploadSimpleComponent);

// Export a function to trigger file input from parent
export function createFileInputTrigger(inputRef: React.RefObject<HTMLInputElement>) {
  return () => inputRef.current?.click();
}

type FileListProps = {
  files: FileWithPreview[];
  onRemove: (id: string) => void;
  disabled: boolean;
};

function FileList({ files, onRemove, disabled }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No documents attached. Click "Add Attachments" to upload files.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Files:</h3>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {files.map(file => (
            <FileItem key={file.id} file={file} onRemove={onRemove} disabled={disabled} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

type FileItemProps = {
  file: FileWithPreview;
  onRemove: (id: string) => void;
  disabled: boolean;
};

function FileItem({ file, onRemove, disabled }: FileItemProps) {
  const Icon = getFileIcon(file.file.type);

  return (
    <div className="space-y-2 rounded-md bg-grayscale-700 p-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon size={25} className="text-primary-500" />
          <div className="flex flex-col max-w-70 min-w-0 flex-1">
            <span className="font-medium truncate">{file.file.name}</span>
            <div className="flex items-center gap-2 text-xs text-grayscale-400">
              <span>{formatFileSize(file.file.size)}</span>
              <span>•</span>
              <span>{file.file.type || "Unknown type"}</span>
            </div>
          </div>
        </div>
        {!disabled && (
          <button
            onClick={() => onRemove(file.id)}
            className="bg-none p-0 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
