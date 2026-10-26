import React, { useState } from "react";
import {
  Plus,
  Images,
  ImagePlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  useCarouselImagesQuery,
  useCreateCarouselMutation,
  useUpdateCarouselMutation,
  useDeleteCarouselMutation,
  useReorderCarouselMutation,
} from "../../hooks/useHomeCarousel";
import { CarouselImageCard } from "./CarouselImageCard";
import { CarouselImageForm } from "./CarouselImageForm";
import { ImagePreviewModal } from "../../components/ImagePreviewModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { FemaleIcon, MaleIcon } from "../../components/GenderIcons";
import { Loader } from "../../components/common/Loader";
import {
  HomeCarouselImage,
  GenderType,
  CreateCarouselPayload,
  UpdateCarouselPayload,
} from "../../types/homeCarousel.types";

export const HomeCarouselPage: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<GenderType>("female");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingImage, setEditingImage] = useState<HomeCarouselImage | null>(null);
  const [previewImage, setPreviewImage] = useState<HomeCarouselImage | null>(null);
  const [deletingImage, setDeletingImage] = useState<HomeCarouselImage | null>(null);

  // Queries for current tab and overview
  const {
    data: images = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useCarouselImagesQuery(selectedGender);

  // Additional query to fetch all images to get counts for both tabs
  const { data: allImages = [] } = useCarouselImagesQuery(undefined);

  const createMutation = useCreateCarouselMutation();
  const updateMutation = useUpdateCarouselMutation();
  const deleteMutation = useDeleteCarouselMutation();
  const reorderMutation = useReorderCarouselMutation();

  const activeCount = images.filter((img) => img.isActive).length;
  const isMaxActiveReached = activeCount >= 5;

  // Counts for both tabs
  const femaleActiveCount = allImages.filter(
    (img) => img.gender === "female" && img.isActive
  ).length;
  const maleActiveCount = allImages.filter(
    (img) => img.gender === "male" && img.isActive
  ).length;

  const handleOpenAddModal = () => {
    setEditingImage(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (image: HomeCarouselImage) => {
    setEditingImage(image);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (image: HomeCarouselImage) => {
    try {
      await updateMutation.mutateAsync({
        id: image._id,
        isActive: !image.isActive,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  const handleMove = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newOrderList = [...images];
    const temp = newOrderList[currentIndex];
    newOrderList[currentIndex] = newOrderList[targetIndex];
    newOrderList[targetIndex] = temp;

    const orderedIds = newOrderList.map((item) => item._id);

    try {
      await reorderMutation.mutateAsync({
        orderedIds,
        gender: selectedGender,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to reorder images");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingImage) return;
    try {
      await deleteMutation.mutateAsync(deletingImage._id);
      setDeletingImage(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete image");
    }
  };

  const handleCreateSubmit = async (payload: CreateCarouselPayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateSubmit = async (payload: UpdateCarouselPayload) => {
    await updateMutation.mutateAsync(payload);
  };

  return (
    <div className="mx-auto flex flex-col gap-7">
      {/* ── 1. Page Header (Icon + Title + Add Button) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Main Module Icon Box with Pink Glow */}
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] border border-[rgba(244,114,182,0.35)] text-admin-primary"
            style={{
              background:
                "linear-gradient(135deg, rgba(244, 114, 182, 0.22) 0%, rgba(219, 39, 119, 0.12) 100%)",
              boxShadow: "0 0 20px rgba(244, 114, 182, 0.15)",
            }}
          >
            <Images size={26} strokeWidth={2.1} />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[1.65rem] font-bold tracking-[-0.02em] text-white">
                Home Carousel
              </h2>
              <button
                onClick={() => refetch()}
                title="Refresh images"
                className="flex items-center justify-center rounded-full bg-transparent p-1 text-admin-muted"
              >
                <RefreshCw
                  size={15}
                  className={isFetching ? "animate-spin" : ""}
                />
              </button>
            </div>
            <p className="mt-[3px] text-[0.85rem] text-admin-muted">
              Manage the 5 rotating profile cards on the mobile app home screen.
            </p>
          </div>
        </div>

        {/* Add Carousel Image Pill Button */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-full px-[22px] py-[10px] text-[0.88rem] font-bold text-[#120E10] transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #F472B6 0%, #EC4899 100%)",
            boxShadow: "0 0 22px rgba(244, 114, 182, 0.35)",
          }}
        >
          <Plus size={18} strokeWidth={2.6} />
          <span>Add Carousel Image</span>
        </button>
      </div>

      {/* ── 2. Category Tabs & Active Slots Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Gender Tabs */}
        <div className="flex flex-1 items-center gap-[14px]">
          {/* Female Tab */}
          <button
            type="button"
            onClick={() => setSelectedGender("female")}
            className={`flex min-w-[240px] cursor-pointer items-center justify-between gap-6 rounded-admin-md px-[18px] py-3 transition-all duration-200 ${selectedGender === "female"
              ? "border border-admin-primary bg-[rgba(244,114,182,0.14)] shadow-[0_0_20px_rgba(244,114,182,0.22)]"
              : "border border-[rgba(244,114,182,0.2)] bg-admin-card"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${selectedGender === "female"
                  ? "bg-[rgba(244,114,182,0.25)] text-admin-primary"
                  : "bg-admin-surface text-admin-muted"
                  }`}
              >
                <FemaleIcon size={20} />
              </div>
              <div className="text-left">
                <div
                  className={`text-[0.92rem] font-bold ${selectedGender === "female" ? "text-white" : "text-admin-muted"
                    }`}
                >
                  Female Images
                </div>
                <div className="mt-[2px] text-[0.74rem] text-admin-subtle">
                  Shown to male users
                </div>
              </div>
            </div>

            <div
              className={`rounded-full px-[9px] py-[3px] text-[0.75rem] font-bold ${selectedGender === "female"
                ? "bg-[rgba(244,114,182,0.25)] text-admin-primary"
                : "bg-[rgba(255,255,255,0.06)] text-admin-muted"
                }`}
            >
              {femaleActiveCount}/5
            </div>
          </button>

          {/* Male Tab */}
          <button
            type="button"
            onClick={() => setSelectedGender("male")}
            className={`flex min-w-[240px] cursor-pointer items-center justify-between gap-6 rounded-admin-md px-[18px] py-3 transition-all duration-200 ${selectedGender === "male"
              ? "border border-blue-500 bg-[rgba(59,130,246,0.14)] shadow-[0_0_20px_rgba(59,130,246,0.22)]"
              : "border border-[rgba(244,114,182,0.2)] bg-admin-card"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${selectedGender === "male"
                  ? "bg-[rgba(59,130,246,0.25)] text-blue-400"
                  : "bg-admin-surface text-admin-muted"
                  }`}
              >
                <MaleIcon size={20} />
              </div>
              <div className="text-left">
                <div
                  className={`text-[0.92rem] font-bold ${selectedGender === "male" ? "text-white" : "text-admin-muted"
                    }`}
                >
                  Male Images
                </div>
                <div className="mt-[2px] text-[0.74rem] text-admin-subtle">
                  Shown to female users
                </div>
              </div>
            </div>

            <div
              className={`rounded-full px-[9px] py-[3px] text-[0.75rem] font-bold ${selectedGender === "male"
                ? "bg-[rgba(59,130,246,0.25)] text-blue-400"
                : "bg-[rgba(255,255,255,0.06)] text-admin-muted"
                }`}
            >
              {maleActiveCount}/5
            </div>
          </button>
        </div>

        {/* Right Status Pill */}
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold ${isMaxActiveReached
            ? "border border-admin-warning bg-admin-warning-bg text-admin-warning"
            : "border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.12)] text-[#34D399]"
            }`}
        >
          {isMaxActiveReached ? (
            <Info size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          <span>
            {activeCount}/5 Active Slots Used (
            {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)})
          </span>
        </div>
      </div>

      {/* ── 3. Main Content / Empty State / Cards Grid ── */}
      {isLoading ? (
        <div className="rounded-admin-lg border border-dashed border-[rgba(244,114,182,0.2)] bg-admin-card py-16">
          <Loader text="Loading carousel images..." size="md" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-admin-lg border border-[rgba(244,114,182,0.2)]-danger bg-admin-danger-bg p-10 text-red-400">
          <AlertCircle size={32} />
          <p className="font-semibold">Failed to load carousel images.</p>
          <button
            onClick={() => refetch()}
            className="rounded-admin bg-red-500 px-[18px] py-2 text-[0.85rem] font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      ) : images.length === 0 ? (
        /* Empty State Container */
        <div
          className="flex flex-col items-center justify-center gap-[18px] rounded-admin-lg px-5 py-[70px] text-center"
          style={{
            backgroundColor: "rgba(28, 21, 24, 0.45)",
            border: "1.5px dashed rgba(244, 114, 182, 0.28)",
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Centered Glowing Icon Box */}
          <div
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[rgba(244,114,182,0.28)] bg-[rgba(244,114,182,0.12)] text-admin-primary"
            style={{ boxShadow: "0 0 20px rgba(244, 114, 182, 0.15)" }}
          >
            <ImagePlus size={28} strokeWidth={2} />
          </div>

          <div>
            <h3 className="text-[1.2rem] font-bold tracking-[-0.01em] text-white">
              No Carousel Images Found
            </h3>
            <p className="mt-[6px] max-w-[460px] text-[0.84rem] leading-[1.5] text-admin-muted">
              There are currently no carousel images configured for the {selectedGender} audience.
              Add up to 5 images to show in the mobile home screen.
            </p>
          </div>

          {/* Add First Image Pill Button */}
          <button
            onClick={handleOpenAddModal}
            className="mt-1 flex items-center gap-2 rounded-full px-6 py-[10px] text-[0.88rem] font-bold text-[#120E10]"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #EC4899 100%)",
              boxShadow: "0 0 20px rgba(244, 114, 182, 0.35)",
            }}
          >
            <Plus size={17} strokeWidth={2.6} />
            <span>Add First Image</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {images.map((image, index) => (
            <CarouselImageCard
              key={image._id}
              image={image}
              index={index}
              totalCount={images.length}
              onPreview={(img) => setPreviewImage(img)}
              onEdit={(img) => handleOpenEditModal(img)}
              onDelete={(img) => setDeletingImage(img)}
              onToggleActive={(img) => handleToggleActive(img)}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isUpdating={updateMutation.isPending || reorderMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Image Upload/Edit Form Modal */}
      <CarouselImageForm
        isOpen={isFormOpen}
        initialData={editingImage}
        defaultGender={selectedGender}
        activeCount={activeCount}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        onSubmitCreate={handleCreateSubmit}
        onSubmitUpdate={handleUpdateSubmit}
      />

      {/* Full Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage?.imageUrl || null}
        title={previewImage?.title || `Slot #${previewImage?.order}`}
        onClose={() => setPreviewImage(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingImage}
        title="Delete Carousel Image"
        message="Are you sure you want to permanently delete this carousel image? It will be removed from MongoDB and AWS S3."
        confirmText="Delete Image"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingImage(null)}
      />
    </div>
  );
};
