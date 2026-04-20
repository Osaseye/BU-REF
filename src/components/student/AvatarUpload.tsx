import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  initialUrl?: string;
  onUpload: (file: File) => void;
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ initialUrl, onUpload, initials, size = 'md' }) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onUpload(file);
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-48 h-48 text-6xl',
  };

  const buttonSizeClasses = {
    sm: 'w-6 h-6 bottom-0 right-0',
    md: 'w-8 h-8 bottom-0 right-0',
    lg: 'w-12 h-12 bottom-2 right-2',
  };

  const iconClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="relative inline-block">
      <div className={`rounded-full overflow-hidden border-4 border-white shadow-lg bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center font-serif font-bold ${sizeClasses[size]}`}>
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`absolute bg-white border border-[var(--color-border)] text-[var(--color-primary)] rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors focus:outline-none ${buttonSizeClasses[size]}`}
        aria-label="Upload profile picture"
      >
        <Camera className={iconClasses[size]} />
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        title="Upload avatar"
      />
    </div>
  );
};
