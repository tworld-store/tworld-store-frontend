/**
 * ImageUploader 컴포넌트
 * 
 * 역할:
 * - 이미지 파일 업로드
 * - 드래그 앤 드롭
 * - 미리보기
 * - Cloudinary 업로드
 * 
 * 사용 예시:
 * ```tsx
 * <ImageUploader
 *   onUpload={(url) => console.log(url)}
 *   maxSize={5}
 *   accept="image/*"
 * />
 * ```
 * 
 * @packageDocumentation
 */

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * ImageUploader Props 인터페이스
 */
export interface ImageUploaderProps {
  /** 업로드 완료 콜백 */
  onUpload: (url: string) => void;
  
  /** 업로드 에러 콜백 */
  onError?: (error: Error) => void;
  
  /** 최대 파일 크기 (MB) */
  maxSize?: number;
  
  /** 허용 파일 타입 */
  accept?: string;
  
  /** 다중 파일 업로드 */
  multiple?: boolean;
  
  /** 기존 이미지 URL */
  defaultValue?: string;
  
  /** 커스텀 클래스명 */
  className?: string;
  
  /** 업로드 폴더 경로 */
  folder?: string;
}

/**
 * ImageUploader 컴포넌트
 * 
 * react-dropzone을 사용하여 드래그 앤 드롭 기능을 제공합니다.
 * Cloudinary를 사용하여 이미지를 업로드합니다.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  onError,
  maxSize = 5, // 5MB
  accept = 'image/*',
  multiple = false,
  defaultValue,
  className = '',
  folder = 'admin',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Cloudinary 업로드 함수
   * 
   * @param file - 업로드할 파일
   * @returns 업로드된 이미지 URL
   */
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary 설정이 누락되었습니다. .env 파일을 확인해주세요.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  /**
   * 파일 처리 함수
   * 
   * @param files - 선택된 파일 목록
   */
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];

      // 파일 크기 검증
      if (file.size > maxSize * 1024 * 1024) {
        const error = new Error(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
        onError?.(error);
        return;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 업로드 시작
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // 프로그레스 시뮬레이션 (실제 진행률은 Cloudinary에서 제공하지 않음)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Cloudinary 업로드
        const url = await uploadToCloudinary(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // 업로드 완료 콜백
        onUpload(url);
      } catch (error) {
        console.error('Upload error:', error);
        onError?.(error as Error);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [maxSize, folder, onUpload, onError]
  );

  /**
   * react-dropzone 설정
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: maxSize * 1024 * 1024,
    multiple,
    disabled: isUploading,
  });

  /**
   * 파일 선택 버튼 클릭
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 이미지 제거
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onUpload('');
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg transition-all cursor-pointer
          ${isDragActive ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {/* 미리보기가 있는 경우 */}
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={handleButtonClick}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  변경
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  제거
                </button>
              </div>
            </div>

            {/* 업로드 진행률 */}
            {isUploading && (
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 미리보기가 없는 경우 */
          <div className="p-8 text-center">
            {/* 업로드 아이콘 */}
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {/* 안내 텍스트 */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? '여기에 놓아주세요'
                  : '이미지를 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF (최대 {maxSize}MB)
              </p>
            </div>

            {/* 업로드 버튼 */}
            {!isDragActive && (
              <button
                type="button"
                onClick={handleButtonClick}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                파일 선택
              </button>
            )}

            {/* 업로드 진행률 */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {uploadProgress}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">업로드 중...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
