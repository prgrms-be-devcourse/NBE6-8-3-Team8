'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃되었습니다.');
      // 프론트엔드에서 /auth/welcome로 리다이렉트
      router.push('/auth/welcome');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
      // 에러가 발생해도 로그인 페이지로 이동
      router.push('/auth/welcome');
    }
  };

  const handleLogin = () => {
    // 로그인 선택 페이지로 이동
    router.push('/auth/welcome');
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <Link href="/">DevMatch</Link>
          </h1>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link href="/" className="hover:underline">홈</Link>
              {isAuthenticated && (
                <>
                  <Link href="/projects/my-projects" className="hover:underline">내 프로젝트</Link>
                  <Link href="/projects/create" className="hover:underline">프로젝트 생성</Link>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              {loading ? (
                <span className="text-sm text-gray-500">로딩중...</span>
              ) : isAuthenticated && user ? (
                <>
                  <span className="text-sm text-gray-700">
                    안녕하세요, <span className="font-medium">{user.nickName}</span>님!
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleLogin}
                >
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}