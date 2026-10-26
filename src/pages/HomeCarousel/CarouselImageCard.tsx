import React from "react";
import { Edit2, Trash2, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { FemaleIcon, MaleIcon } from "../../components/GenderIcons";
import { HomeCarouselImage } from "../../types/homeCarousel.types";

interface CarouselImageCardProps {
  image: HomeCarouselImage;
  index: number;
  totalCount: number;
  onPreview: (image: HomeCarouselImage) => void;
  onEdit: (image: HomeCarouselImage) => void;
  onDelete: (image: HomeCarouselImage) => void;
  onToggleActive: (image: HomeCarouselImage) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isUpdating?: boolean;
}

export const CarouselImageCard: React.FC<CarouselImageCardProps> = ({
  image,
  index,
  totalCount,
  onPreview,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isUpdating = false,
}) => {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card transition-all duration-300 ${image.isActive ? "opacity-100 shadow-admin" : "opacity-60 shadow-none"
        }`}
    >
      {/* Image Container with overlay buttons */}
      <div
        className="relative h-[240px] w-full cursor-pointer overflow-hidden bg-[#0A0809]"
        onClick={() => onPreview(image)}
      >
        <img
          src={image.imageUrl}
          alt={image.title || `Carousel Image ${image.order}`}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.05]"
        />

        {/* Order Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-[rgba(244,114,182,0.2)] bg-black/75 px-[10px] py-1 text-[0.75rem] font-bold text-admin-primary backdrop-blur-[6px]">
          <span>Slot #{image.order}</span>
        </div>

        {/* Zoom Hint Button */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-[4px]">
          <Eye size={16} />
        </div>

        {/* Target Audience Tag */}
        <div
          className={`absolute bottom-3 left-3 flex items-center gap-[5px] rounded-[6px] px-2 py-1 text-[0.7rem] font-semibold uppercase ${image.gender === "female"
              ? "border border-[rgba(244,114,182,0.4)] bg-[rgba(244,114,182,0.25)] text-admin-primary"
              : "border border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.25)] text-blue-400"
            }`}
        >
          {image.gender === "female" ? (
            <FemaleIcon size={12} />
          ) : (
            <MaleIcon size={12} />
          )}
          <span>
            {image.gender === "female" ? "Female (For Males)" : "Male (For Females)"}
          </span>
        </div>
      </div>

      {/* Card Content & Actions */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[0.95rem] font-semibold text-white">
              {image.title || `Carousel Image #${image.order}`}
            </h4>
            <p className="mt-[2px] text-[0.75rem] text-admin-muted">
              Added {new Date(image.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Active Switch */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(image);
            }}
            title={image.isActive ? "Click to deactivate" : "Click to activate"}
            className={`flex items-center gap-1.5 rounded-full border border-[rgba(244,114,182,0.2)] px-[10px] py-1 text-[0.75rem] font-semibold ${image.isActive
                ? "bg-admin-success-bg text-admin-success"
                : "bg-[rgba(255,255,255,0.05)] text-admin-subtle"
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${image.isActive ? "bg-admin-success" : "bg-admin-subtle"
                }`}
            />
            <span>{image.isActive ? "Active" : "Inactive"}</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-[rgba(244,114,182,0.2)] pt-3">
          {/* Reorder Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0 || !onMoveUp || isUpdating}
              onClick={onMoveUp}
              title="Move slot up"
              className={`flex items-center rounded-admin bg-admin-surface p-1.5 ${index === 0 ? "cursor-not-allowed text-admin-subtle" : "cursor-pointer text-admin-primary"
                }`}
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1 || !onMoveDown || isUpdating}
              onClick={onMoveDown}
              title="Move slot down"
              className={`flex items-center rounded-admin bg-admin-surface p-1.5 ${index === totalCount - 1 ? "cursor-not-allowed text-admin-subtle" : "cursor-pointer text-admin-primary"
                }`}
            >
              <ArrowDown size={14} />
            </button>
          </div>

          {/* Edit & Delete */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(image)}
              title="Edit image"
              className="flex items-center gap-1 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-[10px] py-1.5 text-[0.75rem] font-medium text-admin-primary"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(image)}
              title="Delete image"
              className="flex items-center gap-1 rounded-admin border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] px-[10px] py-1.5 text-[0.75rem] font-medium text-red-400"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
