import React, { useState, useCallback } from "react";
import { UploadCloud, Trash2 } from "lucide-react";

interface ImageUploadDragDropProps {
  onImageUpload: (file: File) => void;
  onImageRemove: () => void; 
}

const ImageUploadDragDrop: React.FC<ImageUploadDragDropProps> = ({
  onImageUpload,
  onImageRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onImageUpload(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [onImageUpload]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null); 
    onImageRemove();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 w-full h-64 flex flex-col items-center justify-center text-center transition-colors duration-300 ${
          isDragging
            ? "border-[#ff9404] bg-[#ff9404]/10"
            : "border-gray-500 bg-[#2D3242]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Previsualización de la imagen"
              className="max-h-48 max-w-full object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300"
              title="Eliminar imagen"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400 mb-2">
              Sube una imagen y deja que la IA haga lo demás por ti
            </p>
            <label
              htmlFor="file-upload"
              className="bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white py-2 px-4 font-semibold rounded-lg cursor-pointer hover:from-[#e08503] hover:to-[#ff9404] transition-all duration-300"
            >
              Seleccionar un archivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadDragDrop;
