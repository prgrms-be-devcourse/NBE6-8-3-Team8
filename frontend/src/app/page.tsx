'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { projectApi, userApi } from '@/lib/api';
import { ProjectDetailResponse, UserProjectListResponse, ApplicationDetailResponseDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Sparkles, 
  TrendingUp,
  Code,
  Zap,
  Star,
  ArrowRight,
  FolderOpen,
  FileText
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectDetailResponse[]>([]);
  const [userProjects, setUserProjects] = useState<UserProjectListResponse[]>([]);
  const [userApplications, setUserApplications] = useState<ApplicationDetailResponseDto[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setDataLoading(true);
      const allProjects = await projectApi.getAllProjects();
      setProjects(allProjects);
    } catch (err) {
      console.error('프로젝트 목록 조회 실패:', err);
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchUserProjects = useCallback(async () => {
    if (!user) return;
    try {
      const projects = await userApi.getUserProjects();
      setUserProjects(projects);
    } catch (err) {
      console.error('사용자 프로젝트 목록 조회 실패:', err);
    }
  }, [user]);

  const fetchUserApplications = useCallback(async () => {
    if (!user) return;
    try {
      const applications = await userApi.getUserApplications();
      setUserApplications(applications);
    } catch (err) {
      console.error('사용자 지원서 목록 조회 실패:', err);
    }
  }, [user]);

  // 🔐 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/welcome');
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUserProjects();
      fetchUserApplications();
    }
  }, [user, fetchProjects, fetchUserProjects, fetchUserApplications]);

  // 로딩 중이거나 인증되지 않은 경우
  if (loading || !user) {
    return <div className="container mx-auto py-8">로딩 중...</div>;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto py-8 px-4">
          {/* Title Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-14 w-96 mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-14 w-40 rounded-xl" />
              <Skeleton className="h-14 w-40 rounded-xl" />
            </div>
          </div>

          {/* Activity Cards Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-xl border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" />
              <Skeleton className="h-64 rounded-xl border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" />
            </div>
          </div>

          {/* Projects Grid Skeleton */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              개발자 프로젝트 매칭 플랫폼
            </h1>
            <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 mt-6 mb-8 font-medium">
            함께 작업할 팀원을 찾고 프로젝트를 성공적으로 완료하세요
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-8 py-6 text-lg rounded-xl">
                  <Link href="/projects/create">
                    <Rocket className="mr-2" />
                    프로젝트 생성
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-8 py-6 text-lg rounded-xl">
                  <Link href="/projects/my-projects">
                    <FolderOpen className="mr-2" />
                    내 프로젝트
                  </Link>
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-12 py-6 text-xl rounded-xl">
                <Link href="/auth/welcome">
                  <Sparkles className="mr-2" />
                  시작하기
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black flex items-center gap-2">
              <TrendingUp className="text-purple-600" />
              내 활동
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-purple-50 to-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative overflow-hidden">
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />
                <CardHeader className="border-b-4 border-black bg-purple-100">
                  <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <Code className="text-purple-600" />
                    내 프로젝트
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                {(!userProjects || userProjects.length === 0) ? (
                  <p className="text-gray-600 font-medium">생성한 프로젝트가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {userProjects.slice(0, 3).filter(project => project && project.id).map((project) => (
                      <motion.div 
                        key={project.id} 
                        whileHover={{ x: 5 }}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800">{project.title}</h3>
                          <p className="text-sm text-gray-600 font-medium">{project.currentTeamSize}/{project.teamSize}명</p>
                        </div>
                        <Badge className={`border-2 border-black font-bold ${project.status === 'RECRUITING' ? 'bg-green-400 text-black' : 'bg-gray-300 text-gray-700'}`}>
                          {project.status === 'RECRUITING' ? '모집중' : '완료'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-blue-50 to-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative overflow-hidden">
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />
                <CardHeader className="border-b-4 border-black bg-blue-100">
                  <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <FileText className="text-blue-600" />
                    내 지원서
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                {(!userApplications || userApplications.length === 0) ? (
                  <p className="text-gray-600 font-medium">제출한 지원서가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {userApplications.slice(0, 3).filter(application => application && application.applicationId).map((application) => (
                      <motion.div 
                        key={application.applicationId} 
                        whileHover={{ x: 5 }}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800">프로젝트</h3>
                          <p className="text-sm text-gray-600 font-medium">{new Date(application.appliedAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className={`border-2 border-black font-bold ${application.status === 'PENDING' ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-700'}`}>
                          {application.status === 'PENDING' ? '대기중' : application.status}
                        </Badge>
                      </motion.div>
                    ))}
                    {userApplications && userApplications.length > 3 && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button asChild className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold">
                          <Link href="/applications/my-applications">
                            <ArrowRight className="mr-2" />
                            더보기
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black flex items-center gap-2">
            <Star className="text-yellow-500" />
            모든 프로젝트
          </h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="bg-white hover:bg-gray-100 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold">
              <Link href="/projects/my-projects">
                <ArrowRight className="mr-2" />
                더보기
              </Link>
            </Button>
          </motion.div>
        </div>
        {projects.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 font-medium text-lg"
          >
            등록된 프로젝트가 없습니다.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project, index) => {
              // userProjects 배열에서 현재 프로젝트 ID가 있는지 확인
              const isMyProject = userProjects.some(userProject => userProject.id === project.id);
              
              return (
                <motion.div 
                  key={project.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  <div className="h-full">
                    <ProjectCard project={project} />
                  </div>
                  {isMyProject && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-3 py-1">
                        <Zap className="w-4 h-4 mr-1" />
                        내 프로젝트
                      </Badge>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
    </div>
  );
}
