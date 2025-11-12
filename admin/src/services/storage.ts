/**
 * Storage 서비스
 * 
 * 역할:
 * - Firebase Storage 파일 업로드
 * - Cloudinary 이미지 업로드
 * - 파일 삭제
 * 
 * @packageDocumentation
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

/**
 * 업로드 진행 상태 콜백
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Firebase Storage 업로드
 */
export const FirebaseStorageService = {
  /**
   * 파일 업로드
   * 
   * @param file - 업로드할 파일
   * @param path - 저장 경로
   * @param onProgress - 진행 상태 콜백
   * @returns 다운로드 URL
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // 진행률 추적
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('파일 업로드 실패:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        // 진행률 추적 없이 업로드
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  },

  /**
   * 파일 삭제
   * 
   * @param path - 파일 경로
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      
      await deleteObject(storageRef);
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 다운로드 URL 가져오기
   * 
   * @param path - 파일 경로
   * @returns 다운로드 URL
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('다운로드 URL 가져오기 실패:', error);
      throw error;
    }
  },
};

/**
 * Cloudinary 업로드 옵션
 */
interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any;
}

/**
 * Cloudinary 업로드 결과
 */
interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Cloudinary 서비스
 */
export const CloudinaryService = {
  /**
   * 이미지 업로드
   * 
   * @param file - 업로드할 파일
   * @param options - 업로드 옵션
   * @param onProgress - 진행 상태 콜백
   * @returns 업로드 결과
   */
  async uploadImage(
    file: File,
    options: CloudinaryUploadOptions = {},
    onProgress?: UploadProgressCallback
  ): Promise<CloudinaryUploadResult> {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary 설정이 없습니다.');
      }
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }
      
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }
      
      // XMLHttpRequest로 진행률 추적
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              publicId: response.public_id,
              url: response.url,
              secureUrl: response.secure_url,
              format: response.format,
              width: response.width,
              height: response.height,
              bytes: response.bytes,
            });
          } else {
            reject(new Error(`업로드 실패: ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('네트워크 오류'));
        });
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Cloudinary 업로드 실패:', error);
      throw error;
    }
  },

  /**
   * 이미지 삭제
   * 
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      // TODO: Cloudinary Admin API를 사용하여 삭제
      // 현재는 Firebase Functions를 통해 삭제하는 것을 권장
      console.warn('Cloudinary 이미지 삭제는 Firebase Functions를 통해 구현 필요');
      throw new Error('아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('Cloudinary 이미지 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 이미지 URL 변환
   * 
   * Cloudinary 변환 파라미터를 적용한 URL을 생성합니다.
   * 
   * @param url - 원본 URL
   * @param transformation - 변환 옵션
   * @returns 변환된 URL
   */
  getTransformedUrl(url: string, transformation: string): string {
    // URL에서 upload/ 부분을 찾아서 변환 파라미터 삽입
    // 예: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
    // → https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/v1234/sample.jpg
    
    if (!url.includes('/upload/')) {
      return url;
    }
    
    return url.replace('/upload/', `/upload/${transformation}/`);
  },

  /**
   * 반응형 이미지 URL 생성
   * 
   * @param url - 원본 URL
   * @param sizes - 크기 배열 (예: [300, 600, 900])
   * @returns 크기별 URL 객체
   */
  getResponsiveUrls(url: string, sizes: number[]): Record<number, string> {
    const urls: Record<number, string> = {};
    
    sizes.forEach((size) => {
      const transformation = `w_${size},f_auto,q_auto`;
      urls[size] = this.getTransformedUrl(url, transformation);
    });
    
    return urls;
  },
};

/**
 * 파일 크기 검증
 * 
 * @param file - 파일
 * @param maxSizeMB - 최대 크기 (MB)
 * @returns 검증 결과
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 파일 타입 검증
 * 
 * @param file - 파일
 * @param allowedTypes - 허용된 MIME 타입 배열
 * @returns 검증 결과
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 이미지 파일 검증
 * 
 * @param file - 파일
 * @param maxSizeMB - 최대 크기 (MB)
 * @returns 검증 결과 및 에러 메시지
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validateFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)',
    };
  }
  
  if (!validateFileSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`,
    };
  }
  
  return { valid: true };
}
