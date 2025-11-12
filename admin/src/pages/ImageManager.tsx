/**
 * ImageManager 페이지
 * 
 * 역할:
 * - 이미지 목록 표시
 * - 이미지 업로드 (Cloudinary)
 * - 이미지 검색/필터
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Trash2, Copy } from 'lucide-react';
import ImageUploader from '../components/common/ImageUploader';
import Modal from '../components/common/Modal';

/**
 * ImageManager 페이지 컴포넌트
 * 
 * Cloudinary에 업로드된 이미지를 관리합니다.
 */
const ImageManager: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 샘플 이미지 데이터
   */
  const images = [
    {
      id: '1',
      url: 'https://via.placeholder.com/300x200',
      name: 'product-banner-1.jpg',
      size: '245 KB',
      uploadedAt: '2025-11-10',
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/300x200',
      name: 'hero-image.jpg',
      size: '512 KB',
      uploadedAt: '2025-11-10',
    },
    {
      id: '3',
      url: 'https://via.placeholder.com/300x200',
      name: 'galaxy-s24.png',
      size: '189 KB',
      uploadedAt: '2025-11-09',
    },
  ];

  /**
   * URL 복사
   */
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    console.log('URL 복사됨:', url);
  };

  /**
   * 이미지 업로드 완료
   */
  const handleUpload = (url: string) => {
    console.log('업로드 완료:', url);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">이미지 관리</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cloudinary에 업로드된 이미지를 관리합니다
          </p>
        </div>
        
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Upload size={18} />
          이미지 업로드
        </button>
      </div>

      {/* 검색 */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이미지 검색..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="card group">
            {/* 이미지 */}
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => handleCopyUrl(image.url)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    title="URL 복사"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* 정보 */}
            <div className="card-body">
              <p className="text-sm font-medium text-gray-900 text-ellipsis">
                {image.name}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{image.size}</span>
                <span>{image.uploadedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 업로드 모달 */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="이미지 업로드"
        size="md"
      >
        <ImageUploader
          onUpload={handleUpload}
          maxSize={10}
          folder="admin"
        />
      </Modal>
    </div>
  );
};

export default ImageManager;
