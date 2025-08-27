'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Code, 
  Rocket, 
  CheckCircle,
  Zap,
  Target,
  Layers,
  TrendingUp
} from 'lucide-react';

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔐 인증된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
      return;
    }
  }, [loading, user, router]);
  const handleGoogleLogin = () => {
    authApi.loginWithGoogle();
  };

  const handleKakaoLogin = () => {
    authApi.loginWithKakao();
  };

  const handleNaverLogin = () => {
    authApi.loginWithNaver();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="inline-block p-8 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl mb-8"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              DevMatch
            </motion.h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-gray-800 mb-8"
          >
            개발자들의 프로젝트 매칭 플랫폼
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.05 }}
            className="inline-block"
          >
            <Badge className="text-xl px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black">
              <Rocket className="w-6 h-6 mr-2" />
              함께 만들어가는 개발 생태계
            </Badge>
          </motion.div>
        </motion.div>

        {/* 메인 소개 섹션 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              개발자와 프로젝트를<br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">완벽하게 매칭</span>하세요
            </h2>
            <p className="text-xl font-black text-gray-700 mb-8">
              혼자서는 어려운 프로젝트도 팀과 함께라면 가능합니다. 
              실력있는 개발자들과 팀을 이루어 멋진 프로젝트를 완성해보세요.
            </p>
            <div className="space-y-4">
              <motion.div 
                whileHover={{ x: 10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <span className="font-black text-gray-800 text-lg">기술 스택 기반 팀원 매칭</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <span className="font-black text-gray-800 text-lg">프로젝트 진행 상황 관리</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <span className="font-black text-gray-800 text-lg">개발자 역량 분석 시스템</span>
              </motion.div>
            </div>
          </motion.div>

          {/* 로그인 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardHeader className="text-center border-b-4 border-black bg-gradient-to-br from-purple-100 to-blue-100 p-8">
                <CardTitle className="text-3xl font-black mb-2">지금 시작하세요!</CardTitle>
                <CardDescription className="text-lg font-medium text-gray-700">
                  소셜 로그인으로 간편하게 가입하고<br />
                  프로젝트 매칭을 시작해보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleGoogleLogin}
                    variant="outline" 
                    size="lg" 
                    className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold py-6"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg">Google로 시작하기</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleKakaoLogin}
                    size="lg" 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold py-6 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    <span className="text-lg">카카오로 시작하기</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleNaverLogin}
                    size="lg" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold py-6 flex items-center justify-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-black">
                      <span className="text-green-500 font-black text-sm">N</span>
                    </div>
                    <span className="text-lg">네이버로 시작하기</span>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 기능 소개 섹션 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black inline-block p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              왜 <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">DevMatch</span>인가요?
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="text-center h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <CardContent className="p-8">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Users className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-3">팀원 매칭</h3>
                  <p className="text-gray-700 font-bold leading-relaxed">
                    기술 스택과 경험을 바탕으로 최적의 팀원을 찾아드립니다
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="text-center h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <CardContent className="p-8">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Code className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-3">프로젝트 관리</h3>
                  <p className="text-gray-700 font-bold leading-relaxed">
                    프로젝트 진행 상황을 체계적으로 관리하고 추적할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="text-center h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-green-50 to-yellow-50 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <CardContent className="p-8">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-yellow-400 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Rocket className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-3">성장 지원</h3>
                  <p className="text-gray-700 font-bold leading-relaxed">
                    개발자 역량 분석을 통해 더 나은 개발자로 성장할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* 통계 섹션 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white rounded-2xl p-8 text-center mb-16"
        >
          <motion.h3 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-4xl md:text-5xl font-black mb-12 p-6 bg-gradient-to-br from-purple-100 to-blue-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl inline-block"
          >
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">DevMatch와 함께하는 개발자들</span>
          </motion.h3>
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-5xl font-black text-blue-600 mb-2"
                >
                  <Zap className="w-12 h-12 mx-auto mb-2" />
                  1,200+
                </motion.div>
                <div className="text-gray-800 font-black text-lg">활성 개발자</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                  className="text-5xl font-black text-purple-600 mb-2"
                >
                  <Target className="w-12 h-12 mx-auto mb-2" />
                  350+
                </motion.div>
                <div className="text-gray-800 font-black text-lg">완료된 프로젝트</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-100 to-yellow-100 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                  className="text-5xl font-black text-green-600 mb-2"
                >
                  <Layers className="w-12 h-12 mx-auto mb-2" />
                  15+
                </motion.div>
                <div className="text-gray-800 font-black text-lg">지원 기술 스택</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.5 }}
                  className="text-5xl font-black text-orange-600 mb-2"
                >
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  95%
                </motion.div>
                <div className="text-gray-800 font-black text-lg">프로젝트 성공률</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}