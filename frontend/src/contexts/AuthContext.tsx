'use client';

// ============================================
// 🔐 인증 컨텍스트 (로그인 상태 관리)
// ============================================

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { logout as apiLogout } from '@/lib/api/auth';
import { userApi } from '@/lib/api';
import { User } from '@/types';


// ============================================
// 📊 컨텍스트 타입 정의
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

// ============================================
// 🎯 컨텍스트 생성
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// 🏗️ AuthProvider 컴포넌트
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // 🔄 인증 상태 확인 (페이지 로드 시)
  // ============================================
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Auth Check - API 호출로 인증 상태 확인');
        
        // 🚀 백엔드 API 호출로 현재 사용자 정보 가져오기
        const currentUser = await userApi.getCurrentUser();
        
        if (currentUser) {
          console.log('✅ 인증됨 - 사용자 정보:', currentUser);
          console.log('🔍 nickName 값:', currentUser.nickName);
          console.log('🔍 username 값:', currentUser.username);
          setUser(currentUser);
        } else {
          console.log('❌ 인증 안됨 - 사용자 정보 없음');
          setUser(null);
        }
      } catch (error) {
        console.log('❌ 인증 안됨 - API 호출 실패:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ============================================
  // 🔐 로그인 함수
  // ============================================
  
  const login = (userData: User) => {
    setUser(userData);
  };

  // ============================================
  // 🚪 로그아웃 함수
  // ============================================
  
  const logout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await apiLogout();
      // 로컬 상태 업데이트
      setUser(null);
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      // 에러 발생 시에도 로컬 상태는 업데이트
      setUser(null);
    }
  };


  // ============================================
  // 📦 컨텍스트 값
  // ============================================
  
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 🎯 커스텀 훅
// ============================================

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
