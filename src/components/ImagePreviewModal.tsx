import React from "react";
import { X, ExternalLink } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  title,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-lg">
      <div onClick={(e) => e.stopPropagation()} className="relative flex max-h-[90vh] w-full max-w-[850px] flex-col gap-3.5 rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-5 shadow-admin">
        <div className="flex items-center justify-between">
          <h3 className="text-[1.1rem] text-white">{title || "Image Preview"}</h3>
          <div className="flex items-center gap-2.5">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full image in new tab"
              className="flex items-center rounded-admin bg-admin-surface p-1.5 text-admin-muted"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={onClose}
              title="Close modal"
              className="flex items-center rounded-admin bg-transparent p-1.5 text-admin-muted"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex min-h-[300px] max-h-[70vh] items-center justify-center overflow-hidden rounded-admin-md bg-black">
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
