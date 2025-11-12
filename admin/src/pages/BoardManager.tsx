/**
 * BoardManager 페이지
 * 
 * 역할:
 * - 게시판 목록 관리
 * - 게시글 관리
 * - 게시판 설정
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { MessageSquare, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';

const BoardManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    {
      id: '1',
      title: '2025년 1월 프로모션 안내',
      board: '공지사항',
      author: '관리자',
      views: 245,
      createdAt: '2025-11-10',
    },
    {
      id: '2',
      title: '신규 상품 입고 소식',
      board: '소식',
      author: '관리자',
      views: 189,
      createdAt: '2025-11-09',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">게시판 관리</h2>
          <p className="mt-1 text-sm text-gray-600">게시글을 관리합니다</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          새 게시글
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게시글 검색..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">게시판</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-primary">{post.board}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.views}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-primary" title="보기">
                        <Eye size={18} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary" title="수정">
                        <Edit size={18} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600" title="삭제">
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
    </div>
  );
};

export default BoardManager;
