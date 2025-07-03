import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader = ({ onImageSelect }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (file: File) => {
    onImageSelect(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${dragActive 
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600'
          }
          ${preview ? 'h-64' : 'h-40'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        
        {preview ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain rounded-md" 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Upload className="w-10 h-10 text-teal-500 mb-2" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Glissez et déposez une image ici, ou cliquez pour sélectionner
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              PNG, JPG jusqu'à 5MB
            </p>
          </div>
        )}
      </div>
      
      {preview && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 mr-4"
          >
            Supprimer
          </button>
          <label 
            htmlFor="image-upload" 
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer"
          >
            Changer l'image
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;