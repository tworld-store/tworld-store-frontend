/**
 * Settings 페이지
 * 
 * 역할:
 * - 사이트 기본 정보 설정
 * - SEO 메타 정보 설정
 * - 외부 서비스 연동 설정
 * - 관리자 계정 관리
 * - 시스템 정보 표시
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Search,
  Link2,
  Users,
  Info,
  Save,
  Upload,
  Key,
} from 'lucide-react';
import Loading from '../components/common/Loading';
import ImageUploader from '../components/common/ImageUploader';
import Modal from '../components/common/Modal';

/**
 * 설정 탭 타입
 */
type SettingsTab = 'site' | 'seo' | 'integration' | 'admin' | 'system';

/**
 * Settings 페이지 컴포넌트
 * 
 * 전체 시스템 설정을 관리하는 페이지입니다.
 * 탭 구조로 각 설정 영역을 구분합니다.
 */
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('site');
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);

  /**
   * 설정 저장
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Firebase에 설정 저장
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('설정 저장 완료');
    } catch (error) {
      console.error('설정 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 탭 목록
   */
  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'site', label: '사이트 정보', icon: Globe },
    { id: 'seo', label: 'SEO 설정', icon: Search },
    { id: 'integration', label: '외부 연동', icon: Link2 },
    { id: 'admin', label: '관리자', icon: Users },
    { id: 'system', label: '시스템 정보', icon: Info },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">설정</h2>
          <p className="mt-1 text-sm text-gray-600">
            시스템 설정을 관리합니다
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex items-center gap-2"
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
      </div>

      {/* 탭 네비게이션 */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* 탭 콘텐츠 */}
          {activeTab === 'site' && <SiteSettings onLogoUpload={() => setIsLogoUploadOpen(true)} />}
          {activeTab === 'seo' && <SEOSettings />}
          {activeTab === 'integration' && <IntegrationSettings />}
          {activeTab === 'admin' && <AdminSettings />}
          {activeTab === 'system' && <SystemInfo />}
        </div>
      </div>

      {/* 로고 업로드 모달 */}
      <Modal
        isOpen={isLogoUploadOpen}
        onClose={() => setIsLogoUploadOpen(false)}
        title="로고 업로드"
        size="md"
      >
        <ImageUploader
          onUpload={(url) => {
            console.log('로고 업로드:', url);
            setIsLogoUploadOpen(false);
          }}
          maxSize={2}
          folder="site"
        />
      </Modal>
    </div>
  );
};

/**
 * 사이트 정보 설정 컴포넌트
 */
interface SiteSettingsProps {
  onLogoUpload: () => void;
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ onLogoUpload }) => {
  const [siteData, setSiteData] = useState({
    name: '티월드스토어',
    description: '통신사 공식 대리점 - 휴대폰 최저가 보장',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    contactEmail: 'contact@tworld-store.com',
    contactPhone: '02-1234-5678',
  });

  return (
    <div className="space-y-6">
      {/* 사이트명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사이트명 *
        </label>
        <input
          type="text"
          value={siteData.name}
          onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
          className="input"
          placeholder="예: 티월드스토어"
        />
      </div>

      {/* 사이트 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사이트 설명
        </label>
        <textarea
          value={siteData.description}
          onChange={(e) => setSiteData({ ...siteData, description: e.target.value })}
          className="input"
          rows={3}
          placeholder="사이트에 대한 간단한 설명"
        />
      </div>

      {/* 로고 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          로고
        </label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {siteData.logo ? (
              <img src={siteData.logo} alt="로고" className="w-full h-full object-contain" />
            ) : (
              <Upload size={32} className="text-gray-400" />
            )}
          </div>
          <button
            onClick={onLogoUpload}
            className="btn btn-outline flex items-center gap-2"
          >
            <Upload size={18} />
            로고 업로드
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          권장 크기: 200x200px, PNG 또는 SVG
        </p>
      </div>

      {/* 연락처 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={siteData.contactEmail}
            onChange={(e) => setSiteData({ ...siteData, contactEmail: e.target.value })}
            className="input"
            placeholder="contact@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={siteData.contactPhone}
            onChange={(e) => setSiteData({ ...siteData, contactPhone: e.target.value })}
            className="input"
            placeholder="02-1234-5678"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * SEO 설정 컴포넌트
 */
const SEOSettings: React.FC = () => {
  const [seoData, setSeoData] = useState({
    title: '티월드스토어 - 휴대폰 최저가 보장',
    description: '통신사 공식 대리점, 갤럭시/아이폰 최저가 보장, 빠른 상담',
    keywords: '휴대폰, 갤럭시, 아이폰, 통신사, 티월드',
    ogImage: '/og-image.jpg',
    googleAnalytics: '',
    naverSiteVerification: '',
  });

  return (
    <div className="space-y-6">
      {/* 메타 타이틀 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메타 타이틀 *
        </label>
        <input
          type="text"
          value={seoData.title}
          onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
          className="input"
          placeholder="사이트 제목 (50-60자 권장)"
        />
        <p className="mt-1 text-xs text-gray-500">
          현재 {seoData.title.length}자
        </p>
      </div>

      {/* 메타 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메타 설명 *
        </label>
        <textarea
          value={seoData.description}
          onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
          className="input"
          rows={3}
          placeholder="사이트 설명 (150-160자 권장)"
        />
        <p className="mt-1 text-xs text-gray-500">
          현재 {seoData.description.length}자
        </p>
      </div>

      {/* 키워드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          키워드
        </label>
        <input
          type="text"
          value={seoData.keywords}
          onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
          className="input"
          placeholder="쉼표로 구분 (예: 휴대폰, 갤럭시, 아이폰)"
        />
      </div>

      {/* OG 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OG 이미지 URL
        </label>
        <input
          type="text"
          value={seoData.ogImage}
          onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
          className="input"
          placeholder="https://example.com/og-image.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          권장 크기: 1200x630px
        </p>
      </div>

      {/* Google Analytics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Analytics ID
        </label>
        <input
          type="text"
          value={seoData.googleAnalytics}
          onChange={(e) => setSeoData({ ...seoData, googleAnalytics: e.target.value })}
          className="input"
          placeholder="G-XXXXXXXXXX"
        />
      </div>

      {/* Naver 사이트 인증 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          네이버 사이트 인증 코드
        </label>
        <input
          type="text"
          value={seoData.naverSiteVerification}
          onChange={(e) => setSeoData({ ...seoData, naverSiteVerification: e.target.value })}
          className="input"
          placeholder="네이버 서치어드바이저 인증 코드"
        />
      </div>
    </div>
  );
};

/**
 * 외부 연동 설정 컴포넌트
 */
const IntegrationSettings: React.FC = () => {
  const [integrationData, setIntegrationData] = useState({
    sheetsApiKey: '',
    sheetId: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    telegramBotToken: '',
    telegramChatId: '',
  });

  const [showApiKeys, setShowApiKeys] = useState(false);

  return (
    <div className="space-y-6">
      {/* Google Sheets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Google Sheets</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sheet ID
          </label>
          <input
            type="text"
            value={integrationData.sheetId}
            onChange={(e) => setIntegrationData({ ...integrationData, sheetId: e.target.value })}
            className="input"
            placeholder="스프레드시트 ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={integrationData.sheetsApiKey}
              onChange={(e) => setIntegrationData({ ...integrationData, sheetsApiKey: e.target.value })}
              className="input pr-20"
              placeholder="Google Sheets API Key"
            />
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary hover:underline"
            >
              {showApiKeys ? '숨기기' : '보기'}
            </button>
          </div>
        </div>
      </div>

      {/* Cloudinary */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Cloudinary</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cloud Name
          </label>
          <input
            type="text"
            value={integrationData.cloudinaryCloudName}
            onChange={(e) => setIntegrationData({ ...integrationData, cloudinaryCloudName: e.target.value })}
            className="input"
            placeholder="Cloud Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type={showApiKeys ? 'text' : 'password'}
            value={integrationData.cloudinaryApiKey}
            onChange={(e) => setIntegrationData({ ...integrationData, cloudinaryApiKey: e.target.value })}
            className="input"
            placeholder="Cloudinary API Key"
          />
        </div>
      </div>

      {/* Telegram */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Telegram Bot (추후)</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bot Token
          </label>
          <input
            type={showApiKeys ? 'text' : 'password'}
            value={integrationData.telegramBotToken}
            onChange={(e) => setIntegrationData({ ...integrationData, telegramBotToken: e.target.value })}
            className="input"
            placeholder="Telegram Bot Token"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat ID
          </label>
          <input
            type="text"
            value={integrationData.telegramChatId}
            onChange={(e) => setIntegrationData({ ...integrationData, telegramChatId: e.target.value })}
            className="input"
            placeholder="Telegram Chat ID"
          />
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>주의:</strong> API 키는 안전하게 보관하세요. 
          프로덕션 환경에서는 환경 변수로 관리됩니다.
        </p>
      </div>
    </div>
  );
};

/**
 * 관리자 설정 컴포넌트
 */
const AdminSettings: React.FC = () => {
  const admins = [
    {
      id: '1',
      email: 'admin@tworld-store.com',
      name: '관리자',
      role: 'super-admin',
      lastLogin: '2025-11-12 10:30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">관리자 목록</h3>
        <button className="btn btn-primary flex items-center gap-2">
          <Users size={18} />
          관리자 추가
        </button>
      </div>

      {/* 관리자 테이블 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                권한
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                마지막 로그인
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-primary">{admin.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-sm text-red-600 hover:underline">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 비밀번호 변경 */}
      <div className="pt-6 border-t border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">비밀번호 변경</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현재 비밀번호
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button className="btn btn-primary flex items-center gap-2">
          <Key size={18} />
          비밀번호 변경
        </button>
      </div>
    </div>
  );
};

/**
 * 시스템 정보 컴포넌트
 */
const SystemInfo: React.FC = () => {
  const systemData = {
    version: 'v1.0.0',
    environment: process.env.NODE_ENV || 'development',
    lastDeploy: '2025-11-12 10:30',
    nodeVersion: '18.x',
    reactVersion: '18.2.0',
    database: 'Firestore',
    hosting: 'Vercel + Firebase',
  };

  const services = [
    { name: 'Firebase', status: 'operational', uptime: '99.9%' },
    { name: 'Cloudinary', status: 'operational', uptime: '99.8%' },
    { name: 'Google Sheets', status: 'operational', uptime: '99.7%' },
    { name: 'Vercel', status: 'operational', uptime: '99.9%' },
  ];

  return (
    <div className="space-y-6">
      {/* 버전 정보 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">버전 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">애플리케이션 버전</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {systemData.version}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">환경</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
              {systemData.environment}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Node.js</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {systemData.nodeVersion}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">React</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {systemData.reactVersion}
            </p>
          </div>
        </div>
      </div>

      {/* 인프라 정보 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인프라</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">데이터베이스</span>
            <span className="text-sm font-medium text-gray-900">
              {systemData.database}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">호스팅</span>
            <span className="text-sm font-medium text-gray-900">
              {systemData.hosting}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">마지막 배포</span>
            <span className="text-sm font-medium text-gray-900">
              {systemData.lastDeploy}
            </span>
          </div>
        </div>
      </div>

      {/* 서비스 상태 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-gray-900">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  Uptime: {service.uptime}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  정상
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
