'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  projectApi, 
  applicationApi,
  userApi
} from '@/lib/api';
import * as analysisApi from '@/lib/api/analysis';
import {
  Calendar,
  Users,
  Code2,
  Sparkles,
  Clock,
  Trash2,
  Send,
  Check,
  X,
  UserCheck,
  XCircle,
  AlertCircle,
  FileText,
  Target,
  Rocket,
  Crown,
  Bot
} from 'lucide-react';

import { 
  ProjectDetailResponse, 
  ApplicationDetailResponseDto,
  UserProjectListResponse
} from '@/types';
import { ProjectApplyModal } from '@/components/ui/ProjectApplyModal';
import { ApplicationAnalysisModal } from '@/components/ui/ApplicationAnalysisModal';
import { ApplicationDetailsModal } from '@/components/ui/ApplicationDetailsModal';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationDetailResponseDto[]>([]);
  const [userApplication, setUserApplication] = useState<ApplicationDetailResponseDto | null>(null);
  const [userProjects, setUserProjects] = useState<UserProjectListResponse[]>([]);
  const [_userApplications, setUserApplications] = useState<ApplicationDetailResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingApplicationId, setPendingApplicationId] = useState<number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [processingApplications, setProcessingApplications] = useState<Set<number>>(new Set());
  
  // 역할배분 내용 수정 관련 상태
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  const [contentError, setContentError] = useState('');
  
  // AI 팀 분석 관련 상태
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      
      // ID 유효성 검사
      const projectId = Number(id);
      if (isNaN(projectId) || projectId <= 0) {
        setError('유효하지 않은 프로젝트 ID입니다.');
        return;
      }
      
      console.log('🔍 [Debug] 프로젝트 ID:', projectId);
      
      const [projectData, applicationsData] = await Promise.all([
        projectApi.getProject(projectId),
        projectApi.getProjectApplications(projectId)
      ]);
      
      setProject(projectData);
      setApplications(applicationsData);
      
      console.log('🔍 [Debug] 지원서 목록 데이터:', applicationsData);
      console.log('🔍 [Debug] 지원서 목록 길이:', applicationsData.length);
      
      // 사용자의 프로젝트 목록과 지원서 목록 가져오기 (인증 여부와 관계없이 시도)
      let userProjectsList: UserProjectListResponse[] = [];
      let userApplicationsList: ApplicationDetailResponseDto[] = [];
      
      try {
        console.log('🔍 [Debug] 사용자 데이터 조회 시도...');
        [userProjectsList, userApplicationsList] = await Promise.all([
          userApi.getUserProjects(),
          userApi.getUserApplications()
        ]);
        setUserProjects(userProjectsList);
        setUserApplications(userApplicationsList);
        console.log('🔍 [Debug] 사용자 프로젝트 목록:', userProjectsList);
        console.log('🔍 [Debug] 사용자 지원서 목록:', userApplicationsList);
        
        // content 수정 폼 초기화
        setEditContent(projectData.content || '');
        
        // 현재 프로젝트에 대한 사용자의 지원서 찾기
        if (userApplicationsList && userApplicationsList.length > 0) {
          const userAppFromList = userApplicationsList.find(app => 
            // 현재 프로젝트의 지원서인지 확인 (프로젝트별 지원서는 프로젝트 ID 정보가 없으므로 다른 방법 필요)
            applicationsData.some(projectApp => projectApp.applicationId === app.applicationId)
          );
          
          console.log('🔍 [Debug] 사용자 지원서 매칭 결과:', userAppFromList);
          
          if (userAppFromList) {
            // 이미 applicationData에서 상세 정보를 가지고 있으므로 그것을 사용
            const fullAppData = applicationsData.find(app => app.applicationId === userAppFromList.applicationId);
            if (fullAppData) {
              const appDetails = await applicationApi.getApplication(fullAppData.applicationId);
              console.log('🔍 [Debug] 지원서 상세 정보:', appDetails);
              setUserApplication(appDetails);
            }
          } else {
            console.log('❌ [Debug] 사용자 지원서를 찾지 못함');
            setUserApplication(null);
          }
        } else {
          console.log('❌ [Debug] 사용자 지원서 목록이 비어있음');
          setUserApplication(null);
        }
      } catch (err) {
        console.error('❌ [Debug] 사용자 데이터 조회 실패:', err);
        // 인증되지 않은 사용자거나 API 오류인 경우
        setUserProjects([]);
        setUserApplications([]);
        setUserApplication(null);
      }
    } catch (err) {
      console.error('프로젝트 데이터 조회 실패:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 400) {
          setError('잘못된 요청입니다. 프로젝트 ID를 확인해주세요.');
        } else if (error.response?.status === 404) {
          setError('존재하지 않는 프로젝트입니다.');
        } else if (error.response?.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError('프로젝트 데이터를 불러오는데 실패했습니다.');
        }
      } else {
        setError('프로젝트 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id, fetchProjectData]);

  const handleApply = async (techStacks: string[], techScores: number[]) => {
    if (!user || !project) return;
    
    try {
      setIsApplying(true);
      
      // 프로젝트 생성자인지 확인
      const isProjectOwner = userProjects.some(userProject => userProject.id === project.id);
      
      // 1단계: 지원서 생성
      const tempApplication = await projectApi.applyToProject(project.id, {
        techStacks,
        techScores
      });
      
      // 생성자인 경우 즉시 자동 승인
      if (isProjectOwner) {
        try {
          await applicationApi.updateApplicationStatus(tempApplication.applicationId, 'APPROVED');
          
          // 프로젝트 정보 새로고침
          const updatedProject = await projectApi.getProject(project.id);
          setProject(updatedProject);
          
          // 지원서 목록 새로고침
          const updatedApplications = await projectApi.getProjectApplications(project.id);
          setApplications(updatedApplications);
          
          // 사용자 지원서 정보 업데이트
          const appDetails = await applicationApi.getApplication(tempApplication.applicationId);
          setUserApplication(appDetails);
          
          setIsApplying(false);
          toast.success('기술스택 평가가 완료되었습니다!', {
            description: '프로젝트 생성자로 자동 승인되었습니다.',
            duration: 4000
          });
        } catch (approveErr) {
          console.error('자동 승인 실패:', approveErr);
          toast.error('자동 승인에 실패했습니다.');
          setIsApplying(false);
        }
      } else {
        // 일반 지원자인 경우 기존 로직 (AI 분석 모달)
        setPendingApplicationId(tempApplication.applicationId);
        setShowAnalysisModal(true);
      }
      
    } catch (err) {
      console.error('프로젝트 지원 실패:', err);
      toast.error('프로젝트 지원에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
      setIsApplying(false);
    }
  };

  const handleAnalysisConfirm = async () => {
    try {
      // 최종 지원 확정
      setShowAnalysisModal(false);
      setPendingApplicationId(null);
      setIsApplying(false);
      
      // 지원서 목록 새로고침
      if (project) {
        console.log('🔄 지원서 목록 새로고침 시작...');
        const updatedApplications = await projectApi.getProjectApplications(project.id);
        console.log('📊 업데이트된 지원서 목록:', updatedApplications);
        setApplications(updatedApplications);
        
        // 현재 사용자의 지원서 상태를 즉시 업데이트
        if (user) {
          console.log('👤 현재 사용자 닉네임:', user.nickName);
          const currentUserApp = updatedApplications.find(app => app.nickname === user.nickName);
          console.log('🔍 찾은 사용자 지원서:', currentUserApp);
          if (currentUserApp) {
            setUserApplication(currentUserApp);
            console.log('✅ 사용자 지원서 상태 업데이트 완료:', currentUserApp);
          } else {
            console.log('❌ 사용자 지원서를 찾을 수 없음');
          }
        } else {
          console.log('❌ 사용자 정보가 없음');
        }
      }
      
      toast.success('프로젝트 지원이 완료되었습니다!', {
        description: '지원서가 성공적으로 제출되었습니다.',
        duration: 4000
      });
    } catch (error) {
      console.error('지원 확정 중 오류:', error);
      toast.error('지원 확정에 실패했습니다.');
    }
  };

  const handleAnalysisCancel = async () => {
    // 지원 취소 - 제출된 지원서 삭제
    if (pendingApplicationId) {
      try {
        await applicationApi.deleteApplication(pendingApplicationId);
      } catch (err) {
        console.error('지원서 삭제 실패:', err);
      }
    }
    
    setShowAnalysisModal(false);
    setPendingApplicationId(null);
    setIsApplying(false);
  };

  const handleDeleteApplication = async () => {
    if (!userApplication) {
      console.error('❌ [Delete Application] userApplication이 없습니다');
      return;
    }
    
    if (!userApplication.applicationId) {
      console.error('❌ [Delete Application] applicationId가 없습니다:', userApplication);
      toast.error('지원서 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log('🗑️ [Delete Application] 지원서 삭제 시도:', {
        applicationId: userApplication.applicationId,
        userApplication
      });
      await applicationApi.deleteApplication(userApplication.applicationId);
      setUserApplication(null);
      // 지원서 목록 및 프로젝트 데이터 새로고침 (currentTeamSize 업데이트 포함)
      if (project) {
        const [updatedProject, updatedApplications] = await Promise.all([
          projectApi.getProject(project.id),
          projectApi.getProjectApplications(project.id)
        ]);
        setProject(updatedProject);
        setApplications(updatedApplications);
      }
      toast.success('지원이 취소되었습니다.', {
        description: '지원서가 성공적으로 삭제되었습니다.'
      });
    } catch (err) {
      console.error('지원서 삭제 실패:', err);
      toast.error('지원서 삭제에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 지원서 승인 처리
  const handleApproveApplication = async (applicationId: number) => {
    try {
      setProcessingApplications(prev => new Set([...prev, applicationId]));
      await applicationApi.updateApplicationStatus(applicationId, 'APPROVED');
      
      // 지원서 목록 새로고침
      if (project) {
        const updatedApplications = await projectApi.getProjectApplications(project.id);
        setApplications(updatedApplications);
      }
      toast.success('지원서가 승인되었습니다.');
    } catch (error) {
      console.error('지원서 승인 실패:', error);
      toast.error('지원서 승인에 실패했습니다.');
    } finally {
      setProcessingApplications(prev => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  // 지원서 거부 처리
  const handleRejectApplication = async (applicationId: number) => {
    try {
      setProcessingApplications(prev => new Set([...prev, applicationId]));
      await applicationApi.updateApplicationStatus(applicationId, 'REJECTED');
      
      // 지원서 목록 새로고침
      if (project) {
        const updatedApplications = await projectApi.getProjectApplications(project.id);
        setApplications(updatedApplications);
      }
      toast.success('지원서가 거부되었습니다.');
    } catch (error) {
      console.error('지원서 거부 실패:', error);
      toast.error('지원서 거부에 실패했습니다.');
    } finally {
      setProcessingApplications(prev => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  const handleViewApplicationDetails = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setShowApplicationDetailsModal(true);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await projectApi.deleteProject(project.id);
        toast.success('프로젝트가 삭제되었습니다.', {
          description: '프로젝트가 성공적으로 삭제되었습니다.'
        });
        router.push('/projects/my-projects');
      } catch (err) {
        console.error('프로젝트 삭제 실패:', err);
        toast.error('프로젝트 삭제에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.'
        });
      }
    }
  };

  // 역할배분 수정 모드 진입
  const _handleEditContent = () => {
    if (!project) return;
    setEditContent(project.content || '');
    setContentError('');
    setIsEditingContent(true);
  };

  // 역할배분 수정 취소
  const handleCancelContentEdit = () => {
    setIsEditingContent(false);
    setContentError('');
  };

  // content 유효성 검증
  const validateContent = () => {
    if (!editContent.trim()) {
      setContentError('역할배분 내용을 입력해주세요.');
      return false;
    }
    if (editContent.length > 2000) {
      setContentError('내용은 2000자 이하로 입력해주세요.');
      return false;
    }
    setContentError('');
    return true;
  };

  // 역할배분 내용 저장
  const handleSaveContent = async () => {
    if (!project || !validateContent()) return;
    
    try {
      setIsUpdatingContent(true);
      await projectApi.updateProjectContent(project.id, editContent);
      
      // 프로젝트 데이터 새로고침  
      await fetchProjectData();
      
      setIsEditingContent(false);
      toast.success('역할배분이 성공적으로 수정되었습니다!');
      
    } catch (error) {
      console.error('역할배분 수정 실패:', error);
      toast.error('역할배분 수정에 실패했습니다.');
    } finally {
      setIsUpdatingContent(false);
    }
  };

  // AI 팀 분석 및 프로젝트 완료 처리
  const handleAITeamAnalysis = async () => {
    if (!project) return;
    
    try {
      setIsProcessingAI(true);
      
      // 1. AI 팀 역할 분배 분석 실행
      toast.loading('AI가 팀 역할을 분석하고 있습니다...', { id: 'ai-analysis' });
      const roleAssignmentResult = await analysisApi.createTeamRoleAssignment(project.id);
      
      // 🎯 분석 결과 콘솔 출력
      console.log('=' .repeat(60));
      console.log('🤖 AI 팀 역할 분배 분석 결과');
      console.log('=' .repeat(60));
      console.log('📊 프로젝트:', project.title);
      console.log('👥 팀 규모:', project.teamSize, '명');
      console.log('📝 분석 결과:');
      console.log(roleAssignmentResult);
      console.log('📏 응답 길이:', roleAssignmentResult.length, '자');
      console.log('=' .repeat(60));
      
      // 2. 분석 결과를 프로젝트 content에 저장 (백엔드에서 이미 길이 제한함)
      await projectApi.updateProjectContent(project.id, roleAssignmentResult);
      
      // 3. 프로젝트 상태를 COMPLETED로 변경 (이미 COMPLETED가 아닌 경우에만)
      if (project.status !== 'COMPLETED') {
        await projectApi.updateProjectStatus(project.id, 'COMPLETED');
      }
      
      // 4. 프로젝트 데이터 새로고침
      await fetchProjectData();
      
      toast.success('🎉 AI 팀 분석이 완료되었습니다!', { 
        id: 'ai-analysis',
        description: '역할 배분이 완료되어 프로젝트가 완성되었습니다.',
        duration: 5000
      });
      
    } catch (error) {
      console.error('AI 팀 분석 실패:', error);
      toast.error('AI 팀 분석에 실패했습니다.', { 
        id: 'ai-analysis',
        description: '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto py-8 px-4">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-12 w-96" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-24 rounded-lg" />
              <Skeleton className="h-12 w-24 rounded-lg" />
            </div>
          </div>

          {/* Main Card Skeleton */}
          <div className="mb-8 border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] bg-white rounded-xl">
            <div className="border-b-4 border-gray-300 bg-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
              <Skeleton className="h-1 w-full my-6 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Two Column Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" />
            <Skeleton className="h-96 rounded-xl border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-2xl font-black text-red-500">{error}</div>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <div className="text-2xl font-black text-gray-700">프로젝트를 찾을 수 없습니다.</div>
        </motion.div>
      </div>
    );
  }

  // 프로젝트 ID로 소유자 여부 확인
  const isProjectOwner = userProjects.some(userProject => userProject.id === project.id);
  const hasApplied = !!userApplication;
  
  // 디버깅 로그 추가
  console.log('🔍 [Debug] 렌더링 상태:');
  console.log('- 사용자:', user?.nickName);
  console.log('- 프로젝트 생성자:', project?.creator);
  console.log('- 사용자 프로젝트 목록:', userProjects);
  console.log('- 현재 프로젝트 ID:', project.id);
  console.log('- 프로젝트 소유자 여부 (ID 기반):', isProjectOwner);
  console.log('- 지원서 존재 여부:', hasApplied);
  console.log('- 지원서 데이터:', userApplication);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {project.title}
          </h1>
          {isProjectOwner && (
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleDeleteProject}
                  className="bg-red-500 hover:bg-red-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-gradient-to-br from-purple-100 to-blue-100">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <CardTitle className="text-3xl font-black mb-2">{project.title}</CardTitle>
                  <p className="text-gray-700 font-bold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    생성자: {project.creator}
                  </p>
                </div>
                <Badge className={`${
                  project.status === 'RECRUITING' ? 'bg-green-400 text-black' : 'bg-blue-400 text-black'
                } border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold px-4 py-2 text-base`}>
                  {project.status === 'RECRUITING' && <Sparkles className="w-4 h-4 mr-1" />}
                  {project.status === 'RECRUITING' ? '모집중' : '완료'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-3 border-purple-300 shadow-[4px_4px_0px_0px_rgba(147,51,234,0.3)]">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    프로젝트 설명
                  </h3>
                  <p className="text-gray-700 font-medium leading-relaxed">{project.description}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border-3 border-blue-300 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.3)]">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    기술 스택
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStacks.map((tech, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-blue-400 to-purple-400 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-3 py-1">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
          
              <div className="h-1 bg-gradient-to-r from-purple-400 to-blue-400 my-6 rounded-full"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border-3 border-green-300 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.3)]"
                >
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-700 mb-2 text-center">팀원 모집 현황</h4>
                  <Progress 
                    value={(project.currentTeamSize / project.teamSize) * 100} 
                    showPercentage 
                    indicatorColor="bg-gradient-to-r from-green-400 to-emerald-400"
                    className="mb-2"
                  />
                  <p className="text-center text-sm font-bold text-gray-600">
                    {project.currentTeamSize} / {project.teamSize}명
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="text-center p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border-3 border-orange-300 shadow-[4px_4px_0px_0px_rgba(251,146,60,0.3)]"
                >
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-700 mb-1">예상 기간</h4>
                  <p className="text-2xl font-black text-orange-700">
                    {project.durationWeeks}주
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="text-center p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border-3 border-pink-300 shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)]"
                >
                  <Calendar className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-700 mb-1">생성일</h4>
                  <p className="text-xl font-black text-pink-700">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 역할 배분 및 분석 결과 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardHeader className="border-b-4 border-black bg-gradient-to-br from-yellow-100 to-orange-100">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <Target className="text-orange-600" />
                  역할 배분 및 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {project.content ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex-1"></div>
                      {/* content 수정 버튼 - COMPLETED 상태이고 content가 있고 프로젝트 생성자일 때만 표시 */}
                      {project.status === 'COMPLETED' && project.content && userProjects.some(userProject => userProject.id === project.id) && (
                        <button
                          onClick={() => setIsEditingContent(true)}
                          disabled={isEditingContent}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                          역할배분 수정
                        </button>
                      )}
                    </div>
                    
                    {isEditingContent ? (
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditContent(value);
                            if (value.length > 2000) {
                              setContentError('내용은 2000자를 초과할 수 없습니다.');
                            } else if (value.trim().length === 0) {
                              setContentError('내용을 입력해주세요.');
                            } else {
                              setContentError('');
                            }
                          }}
                          className={`w-full h-32 p-4 border-3 rounded-lg resize-none font-medium ${
                            contentError ? 'border-red-400' : 'border-gray-400'
                          } focus:border-blue-500 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]`}
                          placeholder="역할 배분 및 분석 결과를 입력해주세요..."
                        />
                        
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-bold ${editContent.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}>
                            {editContent.length}/2000
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelContentEdit}
                              disabled={isUpdatingContent}
                              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                              취소
                            </button>
                            <button
                              onClick={handleSaveContent}
                              disabled={isUpdatingContent || !!contentError || editContent.trim().length === 0}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                              {isUpdatingContent ? '저장 중...' : '저장'}
                            </button>
                          </div>
                        </div>
                        
                        {contentError && (
                          <p className="text-red-500 text-sm font-bold">{contentError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{project.content}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">역할 배분 내용이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 지원서 및 팀원 목록 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardHeader className="border-b-4 border-black bg-gradient-to-br from-blue-100 to-purple-100">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <Users className="text-purple-600" />
                  지원서 및 팀원 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  {isProjectOwner ? (
                    project.status === 'COMPLETED' ? (
                      // COMPLETED 상태: AI 평가 버튼
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-3 border-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-black text-lg flex items-center gap-2">
                              <Crown className="w-5 h-5 text-green-600" />
                              프로젝트 생성자
                            </h3>
                            <p className="text-gray-700 font-bold mt-1">
                              팀 구성이 완료되었습니다. AI로 자동 평가를 시작하세요.
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={handleAITeamAnalysis}
                              disabled={isProcessingAI}
                              className="bg-white hover:bg-green-50 text-green-600 border-3 border-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(34,197,94,0.5)] transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Bot className="mr-2 h-4 w-4" />
                              {isProcessingAI ? '분석 중...' : 'AI한테 평가 맡기기'}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      // RECRUITING 상태: 수동 평가 버튼
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl border-3 border-blue-400 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-black text-lg flex items-center gap-2">
                              <Crown className="w-5 h-5 text-blue-600" />
                              프로젝트 생성자
                            </h3>
                            <p className="text-gray-700 font-bold mt-1">
                              팀원들과 같이 기술 스택 평가를 진행해보세요.
                            </p>
                          </div>
                          <ProjectApplyModal 
                            project={project}
                            onApply={handleApply}
                            isApplying={isApplying}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                disabled={isApplying}
                                className="bg-white hover:bg-blue-50 text-blue-600 border-3 border-blue-400 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)] transition-all duration-200 font-bold"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                기술스택 평가하기
                              </Button>
                            </motion.div>
                          </ProjectApplyModal>
                        </div>
                      </motion.div>
                    )
                  ) : hasApplied ? (
                      userApplication?.status === 'REJECTED' ? (
                        // REJECTED 상태: 거절된 사용자 UI
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-3 border-red-400 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-black text-lg flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                거절되었습니다.
                              </h3>
                              <div className="text-gray-700 font-bold mt-1 flex items-center">
                                <span>상태:</span>
                                <Badge className="bg-red-500 text-white border-2 border-black ml-2">
                                  거절됨
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={() => {
                                    if (userApplication?.applicationId) {
                                      setPendingApplicationId(userApplication.applicationId);
                                      setShowAnalysisModal(true);
                                    }
                                  }}
                                  className="bg-white hover:bg-purple-50 text-purple-600 border-3 border-purple-400 shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(147,51,234,0.5)] transition-all duration-200 font-bold"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  분석결과 보기
                                </Button>
                              </motion.div>
                              {/* REJECTED 상태에서는 지원 취소 버튼 숨김 */}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        // PENDING/APPROVED 상태: 기존 UI
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-3 border-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-black text-lg flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-green-600" />
                                이미 지원하셨습니다.
                              </h3>
                              <div className="text-gray-700 font-bold mt-1 flex items-center">
                                <span>상태:</span>
                                <Badge className="bg-yellow-400 text-black border-2 border-black ml-2">
                                  {userApplication?.status === 'PENDING' ? '대기중' : userApplication?.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={() => {
                                    if (userApplication?.applicationId) {
                                      setPendingApplicationId(userApplication.applicationId);
                                      setShowAnalysisModal(true);
                                    }
                                  }}
                                  className="bg-white hover:bg-purple-50 text-purple-600 border-3 border-purple-400 shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(147,51,234,0.5)] transition-all duration-200 font-bold"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  분석결과 보기
                                </Button>
                              </motion.div>
                              {/* 승인된 지원자도 지원 취소 가능 */}
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={handleDeleteApplication}
                                  disabled={isDeleting}
                                  className="bg-white hover:bg-red-50 text-red-600 border-3 border-red-400 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] transition-all duration-200 font-bold"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {isDeleting ? '취소 중...' : '지원 취소'}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    ) : (
                      <ProjectApplyModal 
                        project={project}
                        onApply={handleApply}
                        isApplying={isApplying}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            disabled={isApplying}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold py-6 text-lg"
                          >
                            <Rocket className="mr-2 h-5 w-5" />
                            {isApplying ? '지원 중...' : '프로젝트 지원하기'}
                          </Button>
                        </motion.div>
                      </ProjectApplyModal>
                    )}
                </div>
            
                <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Send className="w-5 h-5 text-purple-600" />
                    지원자 목록 ({applications.length})
                  </h3>
                  {applications.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        console.log('🔍 [Debug] 렌더링 시 지원서 목록:', applications);
                        const filteredApps = applications.filter(app => app && app.nickname);
                        console.log('🔍 [Debug] 필터링된 지원서 목록:', filteredApps);
                        return filteredApps;
                      })().map((application, index) => (
                        <motion.div 
                          key={application.applicationId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-4 border-3 border-black rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                              <span className="font-black text-white text-lg">
                                {application.nickname?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-black text-gray-800">{application.nickname || '알 수 없는 사용자'}</p>
                              <p className="text-sm font-medium text-gray-600">{new Date(application.appliedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {isProjectOwner && application.status === 'PENDING' ? (
                            <div className="flex items-center gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => handleViewApplicationDetails(application.applicationId)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-3 py-1 text-sm"
                                  title="지원서 보기"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => handleApproveApplication(application.applicationId)}
                                  disabled={processingApplications.has(application.applicationId)}
                                  className="bg-green-500 hover:bg-green-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-3 py-1 text-sm"
                                  title="승인"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => handleRejectApplication(application.applicationId)}
                                  disabled={processingApplications.has(application.applicationId)}
                                  className="bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-3 py-1 text-sm"
                                  title="거절"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </div>
                          ) : (
                            <Badge className={`${
                              application.status === 'PENDING' ? 'bg-yellow-400 text-black' : 
                              application.status === 'APPROVED' ? 'bg-green-400 text-black' :
                              'bg-red-400 text-black'
                            } border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-3 py-1`}>
                              {application.status === 'PENDING' ? '대기중' : 
                               application.status === 'APPROVED' ? '승인됨' : '거부됨'}
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-3 border-gray-300 border-dashed">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-bold">아직 지원자가 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI 분석 모달 */}
        {pendingApplicationId && (
          <ApplicationAnalysisModal
            applicationId={pendingApplicationId}
            open={showAnalysisModal}
            onClose={() => {
              setShowAnalysisModal(false);
              setPendingApplicationId(null);
              setIsApplying(false);
            }}
            onConfirm={handleAnalysisConfirm}
            onCancel={handleAnalysisCancel}
            isAlreadyApplied={!!userApplication}
          />
        )}

        {/* 지원서 상세 모달 */}
        {selectedApplicationId && (
          <ApplicationDetailsModal
            applicationId={selectedApplicationId}
            open={showApplicationDetailsModal}
            onClose={() => {
              setShowApplicationDetailsModal(false);
              setSelectedApplicationId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
