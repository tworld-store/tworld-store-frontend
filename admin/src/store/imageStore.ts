/**
 * Image Store (Zustand)
 * 
 * 역할:
 * - Cloudinary 이미지 목록 관리
 * - 업로드 상태 관리
 * - 이미지 검색/필터
 * 
 * @packageDocumentation
 */

import { create } from 'zustand';

/**
 * 이미지 데이터 타입
 */
interface CloudinaryImage {
  id: string;
  url: string;
  publicId: string;
  name: string;
  format: string;
  size: number; // bytes
  width: number;
  height: number;
  folder: string;
  uploadedAt: Date;
}

/**
 * 업로드 진행 상태
 */
interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * Image Store 상태 타입
 */
interface ImageState {
  /** 이미지 목록 */
  images: CloudinaryImage[];
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 업로드 진행 상태 */
  uploads: UploadProgress[];
  
  /** 검색 쿼리 */
  searchQuery: string;
  
  /** 선택된 폴더 */
  selectedFolder: string;
  
  /** 이미지 목록 설정 */
  setImages: (images: CloudinaryImage[]) => void;
  
  /** 이미지 추가 */
  addImage: (image: CloudinaryImage) => void;
  
  /** 이미지 삭제 */
  deleteImage: (id: string) => void;
  
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  
  /** 업로드 시작 */
  startUpload: (fileId: string, fileName: string) => void;
  
  /** 업로드 진행률 업데이트 */
  updateUploadProgress: (fileId: string, progress: number) => void;
  
  /** 업로드 완료 */
  completeUpload: (fileId: string, image: CloudinaryImage) => void;
  
  /** 업로드 실패 */
  failUpload: (fileId: string, error: string) => void;
  
  /** 업로드 목록 초기화 */
  clearUploads: () => void;
  
  /** 검색 쿼리 설정 */
  setSearchQuery: (query: string) => void;
  
  /** 폴더 선택 */
  setSelectedFolder: (folder: string) => void;
  
  /** 필터링된 이미지 가져오기 */
  getFilteredImages: () => CloudinaryImage[];
  
  /** 이미지 가져오기 (ID로) */
  getImageById: (id: string) => CloudinaryImage | undefined;
}

/**
 * Image Store
 * 
 * Cloudinary에 업로드된 이미지들의 상태를 관리합니다.
 */
export const useImageStore = create<ImageState>((set, get) => ({
  // 초기 상태
  images: [],
  isLoading: false,
  uploads: [],
  searchQuery: '',
  selectedFolder: 'all',

  /**
   * 이미지 목록 설정
   * 
   * @param images - 이미지 배열
   */
  setImages: (images) => {
    set({ images });
  },

  /**
   * 이미지 추가
   * 
   * @param image - 추가할 이미지
   */
  addImage: (image) => {
    set((state) => ({
      images: [image, ...state.images],
    }));
  },

  /**
   * 이미지 삭제
   * 
   * @param id - 삭제할 이미지 ID
   */
  deleteImage: (id) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    }));
  },

  /**
   * 로딩 상태 설정
   * 
   * @param loading - 로딩 여부
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  /**
   * 업로드 시작
   * 
   * @param fileId - 파일 ID
   * @param fileName - 파일명
   */
  startUpload: (fileId, fileName) => {
    set((state) => ({
      uploads: [
        ...state.uploads,
        {
          fileId,
          fileName,
          progress: 0,
          status: 'uploading',
        },
      ],
    }));
  },

  /**
   * 업로드 진행률 업데이트
   * 
   * @param fileId - 파일 ID
   * @param progress - 진행률 (0-100)
   */
  updateUploadProgress: (fileId, progress) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.fileId === fileId
          ? { ...upload, progress }
          : upload
      ),
    }));
  },

  /**
   * 업로드 완료
   * 
   * @param fileId - 파일 ID
   * @param image - 업로드된 이미지
   */
  completeUpload: (fileId, image) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.fileId === fileId
          ? { ...upload, progress: 100, status: 'success' }
          : upload
      ),
      images: [image, ...state.images],
    }));
  },

  /**
   * 업로드 실패
   * 
   * @param fileId - 파일 ID
   * @param error - 에러 메시지
   */
  failUpload: (fileId, error) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.fileId === fileId
          ? { ...upload, status: 'error', error }
          : upload
      ),
    }));
  },

  /**
   * 업로드 목록 초기화
   */
  clearUploads: () => {
    set({ uploads: [] });
  },

  /**
   * 검색 쿼리 설정
   * 
   * @param query - 검색 쿼리
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  /**
   * 폴더 선택
   * 
   * @param folder - 폴더명
   */
  setSelectedFolder: (folder) => {
    set({ selectedFolder: folder });
  },

  /**
   * 필터링된 이미지 가져오기
   * 
   * @returns 필터링된 이미지 배열
   */
  getFilteredImages: () => {
    const { images, searchQuery, selectedFolder } = get();
    
    let filtered = images;
    
    // 폴더 필터
    if (selectedFolder !== 'all') {
      filtered = filtered.filter((img) => img.folder === selectedFolder);
    }
    
    // 검색 필터
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter((img) =>
        img.name.toLowerCase().includes(queryLower)
      );
    }
    
    return filtered;
  },

  /**
   * ID로 이미지 가져오기
   * 
   * @param id - 이미지 ID
   * @returns 이미지 또는 undefined
   */
  getImageById: (id) => {
    return get().images.find((img) => img.id === id);
  },
}));

/**
 * 이미지 목록 가져오기 (훅)
 */
export const useImages = () => {
  return useImageStore((state) => state.images);
};

/**
 * 필터링된 이미지 가져오기 (훅)
 */
export const useFilteredImages = () => {
  return useImageStore((state) => state.getFilteredImages());
};

/**
 * 업로드 상태 가져오기 (훅)
 */
export const useUploadStatus = () => {
  return useImageStore((state) => state.uploads);
};

/**
 * 업로드 중인지 확인 (훅)
 */
export const useIsUploading = () => {
  return useImageStore((state) =>
    state.uploads.some((upload) => upload.status === 'uploading')
  );
};
