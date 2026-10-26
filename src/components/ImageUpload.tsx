import React, { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  currentImageUrl?: string;
  onFileSelect: (file: File | null) => void;
  error?: string;
  compact?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onFileSelect,
  error: externalError,
  compact = false,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
    if (!currentImageUrl) {
      setFileName("");
      setFileSize("");
    }
  }, [currentImageUrl]);

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  const handleFile = (file: File) => {
    setLocalError("");

    if (!allowedMimeTypes.includes(file.type)) {
      setLocalError("Please upload a valid image (JPEG, PNG, WEBP, or AVIF).");
      return;
    }

    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileName("");
    setFileSize("");
    setLocalError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const displayedError = localError || externalError;

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/jpg"
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex items-center justify-between gap-3.5 rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-surface p-2.5 transition-colors hover:border-[rgba(244,114,182,0.4)]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-admin bg-black/25 border border-white/10 p-1">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {fileName || "Current Icon"}
                </div>
                <div className="text-[11px] text-admin-muted truncate">
                  {fileSize || "Icon uploaded • Click Change to replace"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-card px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 active:scale-95"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-admin p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="flex h-[68px] cursor-pointer items-center justify-center gap-3 rounded-admin border border-dashed p-3 text-center transition-all duration-200 hover:border-admin-primary"
            style={{
              borderColor: displayedError
                ? "var(--danger)"
                : dragActive
                ? "var(--primary)"
                : "rgba(244,114,182,0.3)",
              backgroundColor: dragActive ? "var(--primary-glow)" : "var(--bg-surface)",
            }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-card text-admin-primary">
              <UploadCloud size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white">
                Click to upload icon or drag & drop
              </p>
              <p className="text-[11px] text-admin-muted">
                PNG, WEBP, JPEG (Max 5MB)
              </p>
            </div>
          </div>
        )}

        {displayedError && (
          <div className="flex items-center gap-1.5 px-1 text-[0.8rem] text-red-400">
            <AlertCircle size={14} />
            <span>{displayedError}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-admin-md p-6 text-center transition-all duration-200"
        style={{ border: `2px dashed ${displayedError ? "var(--danger)" : dragActive ? "var(--primary)" : "var(--border-color-hover)"}`, backgroundColor: dragActive ? "var(--primary-glow)" : "var(--bg-surface)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/jpg"
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative flex max-h-[220px] w-full justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[180px] max-w-full rounded-admin object-contain shadow-admin"
            />
            <button
              onClick={handleClear}
              title="Remove image"
              type="button"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[rgba(244,114,182,0.2)] bg-admin-card text-admin-primary"
            >
              <UploadCloud size={26} />
            </div>
            <div>
              <p className="text-[0.95rem] font-semibold text-white">
                Click to upload or drag & drop
              </p>
              <p className="mt-1 text-[0.8rem] text-admin-muted">
                JPEG, PNG, WEBP, or AVIF (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {fileName && (
        <div className="flex items-center gap-2 px-1 text-[0.8rem] text-admin-muted">
          <ImageIcon size={14} color="var(--primary)" />
          <span className="font-medium text-white">{fileName}</span>
          <span>({fileSize})</span>
        </div>
      )}

      {displayedError && (
        <div className="flex items-center gap-1.5 px-1 text-[0.8rem] text-red-400">
          <AlertCircle size={14} />
          <span>{displayedError}</span>
        </div>
      )}
    </div>
  );
};
