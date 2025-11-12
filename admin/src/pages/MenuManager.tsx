/**
 * MenuManager 페이지
 * 
 * 역할:
 * - 메뉴 목록 관리
 * - 메뉴 추가/수정/삭제
 * - 드래그앤드롭 순서 변경
 * - 계층 구조 관리 (부모-자식)
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  Eye,
  Edit,
  Trash2,
  GripVertical,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Modal from '../components/common/Modal';

/**
 * 메뉴 데이터 타입
 */
interface Menu {
  id: string;
  name: string;
  link: string;
  order: number;
  visible: boolean;
  parentId?: string;
  children?: Menu[];
}

/**
 * MenuManager 페이지 컴포넌트
 * 
 * 헤더/푸터 메뉴를 관리하는 페이지입니다.
 * 드래그앤드롭으로 순서를 변경할 수 있습니다.
 */
const MenuManager: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuLocation, setMenuLocation] = useState<'header' | 'footer'>('header');

  /**
   * 샘플 메뉴 데이터
   */
  const menus: Menu[] = [
    {
      id: '1',
      name: '홈',
      link: '/',
      order: 1,
      visible: true,
    },
    {
      id: '2',
      name: '상품',
      link: '/devices',
      order: 2,
      visible: true,
    },
    {
      id: '3',
      name: '갤럭시',
      link: '/devices?brand=samsung',
      order: 3,
      visible: true,
      parentId: '2',
    },
    {
      id: '4',
      name: '아이폰',
      link: '/devices?brand=apple',
      order: 4,
      visible: true,
      parentId: '2',
    },
    {
      id: '5',
      name: '공지사항',
      link: '/board/notice',
      order: 5,
      visible: true,
    },
    {
      id: '6',
      name: '이벤트',
      link: '/board/event',
      order: 6,
      visible: false,
    },
  ];

  /**
   * 메뉴 추가 핸들러
   */
  const handleAdd = () => {
    setEditingMenu(null);
    setIsAddModalOpen(true);
  };

  /**
   * 메뉴 수정 핸들러
   */
  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setIsAddModalOpen(true);
  };

  /**
   * 메뉴 삭제 핸들러
   */
  const handleDelete = (menuId: string) => {
    // TODO: 확인 모달 표시
    console.log('메뉴 삭제:', menuId);
    // TODO: Firebase에서 삭제
  };

  /**
   * 표시/숨김 토글
   */
  const handleToggleVisible = (menuId: string) => {
    console.log('표시 상태 토글:', menuId);
    // TODO: Firebase 업데이트
  };

  /**
   * 메뉴 저장 (추가/수정)
   */
  const handleSave = (menuData: Partial<Menu>) => {
    console.log('메뉴 저장:', menuData);
    // TODO: Firebase에 저장
    setIsAddModalOpen(false);
  };

  /**
   * 계층 구조를 가진 메뉴 렌더링
   */
  const renderMenuRow = (menu: Menu, level: number = 0) => {
    const hasChildren = menus.some(m => m.parentId === menu.id);
    
    return (
      <React.Fragment key={menu.id}>
        <tr className="hover:bg-gray-50 group">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {/* 드래그 핸들 */}
              <button className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical size={18} />
              </button>
              
              {/* 계층 표시 */}
              {level > 0 && (
                <div style={{ marginLeft: `${level * 20}px` }}>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              )}
              
              <MenuIcon size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {menu.name}
              </span>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ExternalLink size={14} />
              <span>{menu.link}</span>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-900">{menu.order}</span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => handleToggleVisible(menu.id)}
              className={`badge ${
                menu.visible ? 'badge-success' : 'badge-error'
              }`}
            >
              {menu.visible ? '표시' : '숨김'}
            </button>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(menu)}
                className="p-1 text-gray-400 hover:text-primary"
                title="수정"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(menu.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
        
        {/* 자식 메뉴 렌더링 */}
        {hasChildren && menus
          .filter(m => m.parentId === menu.id)
          .map(childMenu => renderMenuRow(childMenu, level + 1))
        }
      </React.Fragment>
    );
  };

  /**
   * 최상위 메뉴만 필터링
   */
  const topLevelMenus = menus.filter(menu => !menu.parentId);

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">메뉴 관리</h2>
          <p className="mt-1 text-sm text-gray-600">
            헤더와 푸터의 메뉴를 관리합니다
          </p>
        </div>
        
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          메뉴 추가
        </button>
      </div>

      {/* 위치 선택 탭 */}
      <div className="card">
        <div className="card-body">
          <div className="flex gap-2">
            <button
              onClick={() => setMenuLocation('header')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                menuLocation === 'header'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              헤더 메뉴
            </button>
            <button
              onClick={() => setMenuLocation('footer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                menuLocation === 'footer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              푸터 메뉴
            </button>
          </div>
        </div>
      </div>

      {/* 메뉴 테이블 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메뉴명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  링크
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순서
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  표시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topLevelMenus.map(menu => renderMenuRow(menu))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>참고:</strong> 드래그앤드롭 기능은 추후 구현 예정입니다. 
          현재는 순서 필드를 직접 수정하여 순서를 변경할 수 있습니다.
        </p>
      </div>

      {/* 메뉴 추가/수정 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingMenu ? '메뉴 수정' : '메뉴 추가'}
        size="md"
      >
        <MenuForm
          menu={editingMenu}
          menus={menus}
          onSave={handleSave}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

/**
 * 메뉴 폼 컴포넌트
 */
interface MenuFormProps {
  menu: Menu | null;
  menus: Menu[];
  onSave: (menu: Partial<Menu>) => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ menu, menus, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: menu?.name || '',
    link: menu?.link || '',
    order: menu?.order || 1,
    visible: menu?.visible ?? true,
    parentId: menu?.parentId || '',
  });

  /**
   * 폼 제출
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    if (!formData.name || !formData.link) {
      alert('메뉴명과 링크를 입력해주세요.');
      return;
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 메뉴명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메뉴명 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="예: 홈, 상품, 공지사항"
        />
      </div>

      {/* 링크 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          링크 *
        </label>
        <input
          type="text"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="input"
          placeholder="예: /, /devices, /board/notice"
        />
      </div>

      {/* 부모 메뉴 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          부모 메뉴 (선택)
        </label>
        <select
          value={formData.parentId}
          onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          className="input"
        >
          <option value="">없음 (최상위 메뉴)</option>
          {menus
            .filter(m => !m.parentId && m.id !== menu?.id)
            .map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </select>
      </div>

      {/* 순서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          순서
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
          className="input"
          min="1"
        />
      </div>

      {/* 표시 여부 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="visible"
          checked={formData.visible}
          onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="visible" className="text-sm font-medium text-gray-700">
          메뉴 표시
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {menu ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
};

export default MenuManager;
