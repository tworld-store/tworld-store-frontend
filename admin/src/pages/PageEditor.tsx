/**
 * PageEditor 페이지
 * 
 * 역할:
 * - 페이지 편집 (Craft.js)
 * - 드래그앤드롭 빌더
 * - 실시간 미리보기
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Upload,
  ArrowLeft,
  Settings,
  Layers,
  Layout,
} from 'lucide-react';
import Loading from '../components/common/Loading';

/**
 * PageEditor 페이지 컴포넌트
 * 
 * Craft.js 기반 페이지 에디터입니다.
 * 드래그앤드롭으로 페이지를 구성할 수 있습니다.
 */
const PageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  /**
   * 페이지 저장
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Craft.js serialize 및 Firestore 저장
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('페이지 저장 완료');
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 페이지 발행
   */
  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // TODO: 페이지 발행 로직
      // 1. 저장
      // 2. HTML 생성 (Firebase Function 호출)
      // 3. 배포
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('페이지 발행 완료');
    } catch (error) {
      console.error('발행 실패:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * 미리보기
   */
  const handlePreview = () => {
    // TODO: 새 창에서 미리보기 열기
    console.log('미리보기');
  };

  /**
   * 뒤로 가기
   */
  const handleBack = () => {
    navigate('/pages');
  };

  return (
    <div className="editor-layout">
      {/* 툴바 */}
      <div className="editor-toolbar">
        <div className="flex items-center gap-4">
          {/* 뒤로 가기 */}
          <button
            onClick={handleBack}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="뒤로 가기"
          >
            <ArrowLeft size={20} />
          </button>

          {/* 페이지 정보 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {pageId === 'new' ? '새 페이지' : '페이지 편집'}
            </h2>
            <p className="text-xs text-gray-500">
              마지막 저장: 방금 전
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="btn btn-outline flex items-center gap-2"
          >
            <Eye size={18} />
            <span>미리보기</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-secondary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loading.Inline size="sm" />
                저장 중...
              </>
            ) : (
              <>
                <Save size={18} />
                저장
              </>
            )}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn btn-primary flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loading.Inline size="sm" />
                발행 중...
              </>
            ) : (
              <>
                <Upload size={18} />
                발행
              </>
            )}
          </button>
        </div>
      </div>

      {/* 좌측 사이드바 - 컴포넌트 툴박스 */}
      <div className="editor-sidebar">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">컴포넌트</h3>
          <p className="text-xs text-gray-500 mt-1">
            드래그하여 추가하세요
          </p>
        </div>

        <div className="p-4">
          {/* TODO: Craft.js Toolbox 컴포넌트 */}
          <div className="space-y-2">
            <div className="p-3 border border-gray-200 rounded-lg text-center hover:border-primary hover:bg-primary-light transition-colors cursor-move">
              <Layout size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">섹션</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg text-center hover:border-primary hover:bg-primary-light transition-colors cursor-move">
              <Layers size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">컨테이너</p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Craft.js 통합 예정
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 중앙 캔버스 */}
      <div className="editor-canvas">
        <div className="canvas-container">
          {/* TODO: Craft.js Canvas 컴포넌트 */}
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-20">
                <Layout size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  페이지 빌더
                </h3>
                <p className="text-gray-600">
                  좌측에서 컴포넌트를 드래그하여 페이지를 만드세요
                </p>
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>개발 중:</strong> Craft.js 통합 작업이 진행 중입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 설정 패널 */}
      <div className="editor-settings">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">설정</h3>
          <p className="text-xs text-gray-500 mt-1">
            선택된 요소의 속성을 편집하세요
          </p>
        </div>

        <div className="p-4">
          {/* TODO: Craft.js Settings Panel */}
          <div className="text-center py-8">
            <Settings size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              요소를 선택하면<br />
              설정이 표시됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
