/**
 * Dashboard 페이지
 * 
 * 역할:
 * - 통계 요약 표시
 * - 최근 활동 표시
 * - 퀵 액션 버튼
 * 
 * @packageDocumentation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileEdit,
  Package,
  Image,
  MessageSquare,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Plus,
} from 'lucide-react';

/**
 * 통계 카드 데이터 타입
 */
interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

/**
 * Dashboard 페이지 컴포넌트
 * 
 * Admin의 메인 대시보드입니다.
 * 주요 통계와 최근 활동을 표시합니다.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  /**
   * 통계 카드 데이터
   */
  const stats: StatCardData[] = [
    {
      title: '전체 페이지',
      value: 12,
      change: '+2',
      icon: FileEdit,
      color: 'bg-blue-500',
    },
    {
      title: '전체 상품',
      value: 156,
      change: '+8',
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: '이미지',
      value: 243,
      change: '+15',
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      title: '게시글',
      value: 89,
      change: '+3',
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ];

  /**
   * 최근 활동 데이터 (샘플)
   */
  const recentActivities = [
    {
      id: 1,
      type: 'page',
      title: '메인 페이지 수정',
      time: '5분 전',
      user: '관리자',
    },
    {
      id: 2,
      type: 'product',
      title: '갤럭시 S24 상품 추가',
      time: '1시간 전',
      user: '관리자',
    },
    {
      id: 3,
      type: 'image',
      title: '프로모션 배너 업로드',
      time: '2시간 전',
      user: '관리자',
    },
    {
      id: 4,
      type: 'board',
      title: '공지사항 게시글 작성',
      time: '3시간 전',
      user: '관리자',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="mt-1 text-sm text-gray-600">
          티월드스토어 관리 현황을 확인하세요
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <div key={stat.title} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">이번 주</span>
                      </div>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 퀵 액션 */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">퀵 액션</h3>
          </div>
          <div className="card-body space-y-3">
            <button
              onClick={() => navigate('/pages/edit/new')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus size={20} />
              <span className="font-medium">새 페이지 만들기</span>
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Package size={20} />
              <span className="font-medium">상품 관리</span>
            </button>
            
            <button
              onClick={() => navigate('/images')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Image size={20} />
              <span className="font-medium">이미지 업로드</span>
            </button>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">최근 활동</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 사이트 방문자 */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">사이트 방문자</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-600 mt-1">오늘</p>
              </div>
              <Eye size={32} className="text-gray-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">이번 주</span>
                <span className="font-medium text-gray-900">8,456</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">이번 달</span>
                <span className="font-medium text-gray-900">32,890</span>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">시스템 상태</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Firebase</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                정상
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cloudinary</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                정상
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Sheets</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                정상
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">마지막 동기화</span>
              <span className="text-xs text-gray-500">5분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
