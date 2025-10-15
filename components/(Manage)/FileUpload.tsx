import { ChangeEvent, useRef, useState } from "react";
import { Input } from "react-aria-components";
import { Label } from "../ui/label";
import {
  File,
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Plus,
  X,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";

type FileWithProgress = {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
};

export function FileUpload() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      id: file.name,
    }));

    setFiles([...files, ...newFiles]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeFile(id: string) {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <h2>Documents</h2>
      <div>
        <FileInput
          inputRef={inputRef}
          disabled={uploading}
          onFileSelect={handleFileSelect}
        />
      </div>
      <FileList files={files} onRemove={removeFile} uploading={uploading} />
    </div>
  );
}

type FileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ inputRef, disabled, onFileSelect }: FileInputProps) {
  return (
    <>
      <Input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        className={"hidden"}
        id="fileUpload"
        disabled={disabled}
      />

      <Label
        htmlFor="fileUpload"
        className="border-1 rounded-md px-4 py-2 bg-primary text-white hover:bg-primary/90 flex gap-2 w-fit items-center text-xs"
      >
        <Plus size={16} />
        Add attachments
      </Label>
    </>
  );
}

type FileListProps = {
  files: FileWithProgress[];
  onRemove: (id: string) => void;
  uploading: boolean;
};

function FileList({ files, onRemove, uploading }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Files:</h3>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onRemove={onRemove}
              uploading={uploading}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

type FileItemProps = {
  file: FileWithProgress;
  onRemove: (id: string) => void;
  uploading: boolean;
};

function FileItem({ file, onRemove, uploading }: FileItemProps) {
  const Icon = getFileIcon(file.file.type);

  return (
    <div className="space-y-2 rounded-md bg-grayscale-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon size={40} className="text-primary-500" />
          <div className="flex flex-col max-w-70 min-w-0 flex-1">
            <span className="font-medium truncate">{file.file.name}</span>
            <div className="flex items-center gap-2 text-xs text-grayscale-400">
              <span>{formatFileSize(file.file.size)}</span>
              <span>•</span>
              <span>{file.file.type || "Unknown type"}</span>
            </div>
          </div>
        </div>
        {!uploading && (
          <button onClick={() => onRemove(file.id)} className="bg-none p-0">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="text-right text-xs">
        {file.uploaded ? "Completed" : `${Math.round(file.progress)}%`}
      </div>
      <Progress value={file.progress} />
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
