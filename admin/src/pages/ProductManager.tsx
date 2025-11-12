/**
 * ProductManager 페이지
 * 
 * 역할:
 * - 상품 목록 표시
 * - 상품 검색/필터
 * - Google Sheets 동기화
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import Loading from '../components/common/Loading';

/**
 * 샘플 상품 데이터 타입
 */
interface Product {
  id: string;
  model: string;
  brand: string;
  storage: number;
  price: number;
  stock: 'in-stock' | 'out-of-stock';
  featured: boolean;
}

/**
 * ProductManager 페이지 컴포넌트
 * 
 * 상품을 관리하는 페이지입니다.
 * Google Sheets와 동기화하여 상품 데이터를 관리합니다.
 */
const ProductManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  /**
   * 샘플 상품 데이터
   */
  const products: Product[] = [
    {
      id: '1',
      model: '갤럭시 S24 Ultra',
      brand: 'samsung',
      storage: 256,
      price: 1590000,
      stock: 'in-stock',
      featured: true,
    },
    {
      id: '2',
      model: 'iPhone 15 Pro',
      brand: 'apple',
      storage: 256,
      price: 1550000,
      stock: 'in-stock',
      featured: true,
    },
    {
      id: '3',
      model: '갤럭시 Z Fold5',
      brand: 'samsung',
      storage: 512,
      price: 2390000,
      stock: 'out-of-stock',
      featured: false,
    },
  ];

  /**
   * Google Sheets 동기화
   */
  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // TODO: Firebase Function 호출하여 Sheets 동기화
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('동기화 완료');
    } catch (error) {
      console.error('동기화 실패:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">상품 관리</h2>
          <p className="mt-1 text-sm text-gray-600">
            Google Sheets와 연동하여 상품을 관리합니다
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn btn-primary flex items-center gap-2"
        >
          {isSyncing ? (
            <>
              <Loading.Inline size="sm" />
              동기화 중...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              동기화
            </>
          )}
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품 검색..."
                className="input pl-10"
              />
            </div>

            {/* 브랜드 필터 */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">전체 브랜드</option>
              <option value="samsung">삼성</option>
              <option value="apple">애플</option>
              <option value="etc">기타</option>
            </select>

            {/* 필터 버튼 */}
            <button className="btn btn-outline flex items-center gap-2">
              <Filter size={18} />
              <span>필터</span>
            </button>
          </div>
        </div>
      </div>

      {/* 상품 테이블 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  브랜드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  용량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.model}
                        </div>
                        {product.featured && (
                          <span className="badge badge-primary mt-1">추천</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {product.brand}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {product.storage}GB
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {product.price.toLocaleString()}원
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        product.stock === 'in-stock'
                          ? 'badge-success'
                          : 'badge-error'
                      }`}
                    >
                      {product.stock === 'in-stock' ? '재고있음' : '품절'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-gray-400 hover:text-primary"
                        title="보기"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-primary"
                        title="수정"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>참고:</strong> 상품 데이터는 Google Sheets에서 관리됩니다. 
          동기화 버튼을 클릭하여 최신 데이터를 불러오세요.
        </p>
      </div>
    </div>
  );
};

export default ProductManager;
