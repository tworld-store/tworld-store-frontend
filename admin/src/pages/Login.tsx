/**
 * Login 페이지
 * 
 * 역할:
 * - 관리자 로그인
 * - Firebase Auth 연동
 * - 에러 처리
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Loading from '../components/common/Loading';

/**
 * Login 페이지 컴포넌트
 * 
 * 관리자 로그인 페이지입니다.
 * Firebase Authentication을 사용하여 인증합니다.
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 로그인 처리
   * 
   * @param e - Form 이벤트
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Firebase Auth 로그인 구현
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 임시: 2초 후 대시보드로 이동
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('로그인 성공:', email);
      navigate('/');
    } catch (err) {
      console.error('로그인 에러:', err);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">티월드스토어 Admin</h1>
          <p className="mt-2 text-sm text-gray-600">관리자 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading.Inline size="sm" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* 부가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              문제가 발생하면 시스템 관리자에게 문의하세요.
            </p>
          </div>
        </div>

        {/* 개발 모드 안내 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium">개발 모드</p>
            <p className="text-xs text-yellow-600 mt-1">
              Firebase Auth 연동 전까지 임시로 모든 입력을 허용합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
