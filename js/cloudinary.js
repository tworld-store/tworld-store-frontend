/**
 * ═══════════════════════════════════════════════════
 * Cloudinary 이미지 URL 생성 헬퍼
 * ═══════════════════════════════════════════════════
 * 
 * 용도: images.json에 저장된 경로를 완전한 Cloudinary URL로 변환
 * 특징: 반응형, WebP 자동 변환, 최적화
 */

/**
 * ───────────────────────────────────────────────
 * Cloudinary 설정
 * ───────────────────────────────────────────────
 * 
 * ⚠️ 실제 사용시 cloud_name을 본인의 값으로 변경하세요
 */
const CLOUDINARY_CONFIG = {
    cloud_name: 'dlmxe5kpd',  // ← 여기에 실제 Cloud Name 입력
    base_url: 'https://res.cloudinary.com',
    default_quality: 'auto',
    default_format: 'webp'
};

/**
 * ───────────────────────────────────────────────
 * Cloudinary Cloud Name 설정
 * ───────────────────────────────────────────────
 * 
 * @param {string} cloudName - Cloudinary Cloud Name
 * 
 * 사용 예시:
 * setCloudinaryConfig('my-cloud-name');
 */
function setCloudinaryConfig(cloudName) {
    CLOUDINARY_CONFIG.cloud_name = cloudName;
    console.log(`✅ Cloudinary 설정 완료: ${cloudName}`);
}

/**
 * ───────────────────────────────────────────────
 * 이미지 URL 생성 (메인 함수)
 * ───────────────────────────────────────────────
 * 
 * @param {string} path - images.json에 저장된 경로
 * @param {object} options - 변환 옵션
 * @returns {string} 완전한 Cloudinary URL
 * 
 * options:
 * - width: 너비 (픽셀)
 * - height: 높이 (픽셀)
 * - quality: 품질 ('auto', 'low', 'high', 1-100)
 * - format: 포맷 ('webp', 'jpg', 'png')
 * - crop: 크롭 모드 ('fill', 'fit', 'scale', 'crop')
 * 
 * 사용 예시:
 * getImageUrl('devices/samsung/galaxy-s24/black/thumb.jpg', {
 *   width: 400,
 *   height: 400
 * });
 * 
 * 결과:
 * https://res.cloudinary.com/your-cloud/image/upload/
 * w_400,h_400,q_auto,f_webp,c_fill/devices/samsung/galaxy-s24/black/thumb.jpg
 */
function getImageUrl(path, options = {}) {
    // 1. 경로 검증
    if (!path) {
        console.error('❌ 이미지 경로가 없습니다');
        return '';
    }
    
    // 2. Cloud Name 검증
    if (CLOUDINARY_CONFIG.cloud_name === 'your-cloud-name') {
        console.warn('⚠️ Cloudinary Cloud Name을 설정하세요: setCloudinaryConfig("your-name")');
    }
    
    // 3. 옵션 추출
    const {
        width,
        height,
        quality = CLOUDINARY_CONFIG.default_quality,
        format = CLOUDINARY_CONFIG.default_format,
        crop = 'fill'
    } = options;
    
    // 4. 변환 파라미터 생성
    const transforms = [];
    
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);
    
    // 크롭 모드는 width나 height가 있을 때만
    if (width || height) {
        transforms.push(`c_${crop}`);
    }
    
    // 5. URL 조립
    const transformStr = transforms.join(',');
    const url = `${CLOUDINARY_CONFIG.base_url}/${CLOUDINARY_CONFIG.cloud_name}/image/upload/${transformStr}/${path}`;
    
    return url;
}

/**
 * ───────────────────────────────────────────────
 * 반응형 이미지 URL 생성
 * ───────────────────────────────────────────────
 * 
 * 3가지 크기의 URL을 한번에 생성:
 * - desktop: 원본 크기
 * - tablet: 75% 크기
 * - mobile: 50% 크기
 * 
 * @param {string} path - 이미지 경로
 * @param {object} baseOptions - 기본 옵션 (desktop 기준)
 * @returns {object} { desktop, tablet, mobile }
 * 
 * 사용 예시:
 * const urls = getResponsiveUrls('devices/samsung/galaxy-s24/black/thumb.jpg', {
 *   width: 800,
 *   height: 800
 * });
 * 
 * 결과:
 * {
 *   desktop: "...w_800,h_800...",
 *   tablet: "...w_600,h_600...",
 *   mobile: "...w_400,h_400..."
 * }
 */
function getResponsiveUrls(path, baseOptions = {}) {
    const { width, height, ...otherOptions } = baseOptions;
    
    return {
        desktop: getImageUrl(path, { width, height, ...otherOptions }),
        tablet: getImageUrl(path, { 
            width: width ? Math.round(width * 0.75) : undefined,
            height: height ? Math.round(height * 0.75) : undefined,
            ...otherOptions 
        }),
        mobile: getImageUrl(path, { 
            width: width ? Math.round(width * 0.5) : undefined,
            height: height ? Math.round(height * 0.5) : undefined,
            ...otherOptions 
        })
    };
}

/**
 * ───────────────────────────────────────────────
 * 썸네일 URL 생성 (편의 함수)
 * ───────────────────────────────────────────────
 * 
 * 자주 사용하는 썸네일 크기들을 빠르게 생성
 * 
 * @param {string} path - 이미지 경로
 * @param {string} size - 크기 ('small', 'medium', 'large')
 * @returns {string} Cloudinary URL
 * 
 * 크기 정의:
 * - small: 200x200
 * - medium: 400x400
 * - large: 800x800
 */
function getThumbnailUrl(path, size = 'medium') {
    const sizes = {
        small: { width: 200, height: 200 },
        medium: { width: 400, height: 400 },
        large: { width: 800, height: 800 }
    };
    
    const dimensions = sizes[size] || sizes.medium;
    
    return getImageUrl(path, dimensions);
}

/**
 * ───────────────────────────────────────────────
 * 배너 URL 생성 (편의 함수)
 * ───────────────────────────────────────────────
 * 
 * @param {string} path - 이미지 경로
 * @param {string} type - 배너 타입
 * @returns {string} Cloudinary URL
 * 
 * 배너 타입:
 * - hero: 1200x500 (메인 히어로)
 * - middle: 860x300 (중간 배너)
 * - promo: 420x420 (프로모션 블록)
 */
function getBannerUrl(path, type = 'hero') {
    const sizes = {
        hero: { width: 1200, height: 500 },
        middle: { width: 860, height: 300 },
        promo: { width: 420, height: 420 }
    };
    
    const dimensions = sizes[type] || sizes.hero;
    
    return getImageUrl(path, {
        ...dimensions,
        crop: 'fill'
    });
}

/**
 * ───────────────────────────────────────────────
 * 상세 섹션 URL 생성 (편의 함수)
 * ───────────────────────────────────────────────
 * 
 * device-detail.html 하단의 긴 프로모션 이미지용
 * 
 * @param {string} path - 이미지 경로
 * @returns {string} Cloudinary URL
 * 
 * 특징:
 * - 너비 고정 (860px)
 * - 높이 자동 (비율 유지)
 */
function getDetailSectionUrl(path) {
    return getImageUrl(path, {
        width: 860,
        crop: 'scale'  // 비율 유지
    });
}

/**
 * ───────────────────────────────────────────────
 * placeholder 이미지 URL 생성
 * ───────────────────────────────────────────────
 * 
 * 이미지 로딩 중 표시할 placeholder
 * 
 * @param {number} width - 너비
 * @param {number} height - 높이
 * @param {string} text - 표시할 텍스트
 * @returns {string} Cloudinary placeholder URL
 */
function getPlaceholderUrl(width, height, text = 'Loading...') {
    // Cloudinary의 text overlay 기능 사용
    return `${CLOUDINARY_CONFIG.base_url}/${CLOUDINARY_CONFIG.cloud_name}/image/upload/w_${width},h_${height},c_fill,b_rgb:f0f0f0,co_rgb:999999,l_text:Arial_24:${encodeURIComponent(text)}/placeholder.jpg`;
}

/**
 * ───────────────────────────────────────────────
 * 이미지 존재 여부 확인
 * ───────────────────────────────────────────────
 * 
 * @param {string} path - 이미지 경로
 * @returns {Promise<boolean>} 존재 여부
 * 
 * 사용 예시:
 * const exists = await checkImageExists('devices/samsung/galaxy-s24/black/thumb.jpg');
 * if (!exists) {
 *   console.log('이미지가 없습니다');
 * }
 */
async function checkImageExists(path) {
    const url = getImageUrl(path, { width: 1 });  // 최소 크기로 확인
    
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('이미지 확인 실패:', error);
        return false;
    }
}

/**
 * ───────────────────────────────────────────────
 * 내보내기
 * ───────────────────────────────────────────────
 */
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 환경
    module.exports = {
        setCloudinaryConfig,
        getImageUrl,
        getResponsiveUrls,
        getThumbnailUrl,
        getBannerUrl,
        getDetailSectionUrl,
        getPlaceholderUrl,
        checkImageExists
    };
}

// 브라우저 환경에서는 window 객체에 자동으로 추가됨