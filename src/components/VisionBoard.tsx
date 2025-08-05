import React, { useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api";
import {
  Upload,
  RotateCw,
  RotateCcw,
  Trash2,
  Download,
  X,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

interface VisionImage {
  id: string;
  fileName: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
}

interface VisionBoardProps {
  boardId: string;
  year: number;
  month: number;
  images: VisionImage[];
  onImagesChange: (images: VisionImage[]) => void;
  onClose: () => void;
}

export default function VisionBoard({
  boardId,
  year,
  month,
  images,
  onImagesChange,
  onClose,
}: VisionBoardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const newImage = await apiClient.addImageToVisionBoard(boardId, file);
      onImagesChange([...images, newImage]);
      toast({
        title: "Success!",
        description: "Image added to vision board.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageUpdate = async (
    imageId: string,
    updates: Partial<VisionImage>
  ) => {
    try {
      await apiClient.updateVisionImage(boardId, imageId, updates);

      const updatedImages = images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      );
      onImagesChange(updatedImages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update image position.",
        variant: "destructive",
      });
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await apiClient.deleteVisionImage(boardId, imageId);
      const updatedImages = images.filter((img) => img.id !== imageId);
      onImagesChange(updatedImages);
      setSelectedImage(null);
      toast({
        title: "Success!",
        description: "Image deleted from vision board.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const handleRotate = (imageId: string, direction: "left" | "right") => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    const newRotation =
      direction === "left" ? image.rotation - 90 : image.rotation + 90;

    handleImageUpdate(imageId, { rotation: newRotation });
  };

  const bringToFront = (imageId: string) => {
    const maxZIndex = Math.max(...images.map((img) => img.zIndex), 0);
    handleImageUpdate(imageId, { zIndex: maxZIndex + 1 });
  };

  const sendToBack = (imageId: string) => {
    const minZIndex = Math.min(...images.map((img) => img.zIndex), 0);
    handleImageUpdate(imageId, { zIndex: minZIndex - 1 });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vision Board - {months[month]} {year}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {images.length} images • Click and drag to move, resize handles to
              resize
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Add Image"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Vision Board Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="w-full h-full relative">
            {images && images.length > 0 ? (
              images.map((image) => (
                <Rnd
                  key={image.id}
                  default={{
                    x: image.position.x,
                    y: image.position.y,
                    width: image.size.width,
                    height: image.size.height,
                  }}
                  position={{
                    x: image.position.x,
                    y: image.position.y,
                  }}
                  size={{
                    width: image.size.width,
                    height: image.size.height,
                  }}
                  style={{
                    zIndex: image.zIndex,
                  }}
                  onDragStop={(e, d) => {
                    handleImageUpdate(image.id, {
                      position: { x: d.x, y: d.y },
                    });
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    handleImageUpdate(image.id, {
                      position: { x: position.x, y: position.y },
                      size: {
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                      },
                    });
                  }}
                  className=""
                  onClick={() => setSelectedImage(image.id)}
                  onDoubleClick={() => bringToFront(image.id)}
                >
                  <div className="w-full h-full relative group">
                    <img
                      src={apiClient.getVisionImage(image.id)}
                      alt="Vision board image"
                      className="w-full h-full object-contain"
                      draggable={false}
                      style={{
                        minWidth: "50px",
                        minHeight: "50px",
                        transform: `rotate(${image.rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                      onError={(e) => {
                        console.error("Failed to load image:", image.id);
                        // Show a fallback
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", image.id);
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Image failed to load</p>
                      </div>
                    </div>

                    {/* Image Controls Overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotate(image.id, "left");
                        }}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotate(image.id, "right");
                        }}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageDelete(image.id);
                        }}
                        className="text-white hover:bg-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Rnd>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No images yet</p>
                  <p className="text-sm">
                    Click "Add Image" to upload your first image
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          title="Upload image for vision board"
        />
      </div>
    </div>
  );
}
