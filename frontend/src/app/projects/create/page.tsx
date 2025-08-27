'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { projectApi } from '@/lib/api';
import { ProjectCreateRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Rocket,
  Code2,
  FileText,
  Users,
  Clock,
  Plus,
  X,
  ArrowLeft,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    teamSize: '',
    durationWeeks: '',
  });
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTechStack = (tech: string): string | null => {
    const trimmedTech = tech.trim();
    
    // 빈 문자열 체크
    if (!trimmedTech) {
      return '기술 스택을 입력해주세요.';
    }
    
    // 길이 체크 (1-30자)
    if (trimmedTech.length < 1 || trimmedTech.length > 30) {
      return '기술 스택은 1글자 이상 30글자 이하로 입력해주세요.';
    }
    
    // 백엔드 정규식과 동일하게 - 영문, 숫자, 공백, 점, 플러스, 샵, 하이픈만 허용
    const validPattern = /^[\w .+#-]+$/;
    if (!validPattern.test(trimmedTech)) {
      return '기술 스택에는 영문, 숫자, 공백, 점(.), 플러스(+), 샵(#), 하이픈(-)만 사용할 수 있습니다.';
    }
    
    // 연속된 특수문자나 공백 체크
    if (/[\-\.\+\s#]{2,}/.test(trimmedTech)) {
      return '연속된 특수문자나 공백은 사용할 수 없습니다.';
    }
    
    // 시작/끝 특수문자 체크 (단, 문자+#은 허용 예: C#, F#)
    if (/^[\-\.\+\s]|[\-\.\+\s]$/.test(trimmedTech)) {
      return '기술 스택은 하이픈(-), 점(.), 플러스(+), 공백으로 시작하거나 끝날 수 없습니다.';
    }
    
    // # 기호는 시작은 불가, 끝은 가능 (C#, F# 허용)
    if (/^#/.test(trimmedTech)) {
      return '기술 스택은 #으로 시작할 수 없습니다.';
    }
    
    // 중복 체크
    if (techStacks.includes(trimmedTech)) {
      return '이미 추가된 기술 스택입니다.';
    }
    
    return null; // 유효함
  };

  const addTechStack = () => {
    const error = validateTechStack(currentTech);
    if (error) {
      toast.error(error);
      return;
    }
    
    const trimmedTech = currentTech.trim();
    setTechStacks(prev => [...prev, trimmedTech]);
    setCurrentTech('');
  };

  const removeTechStack = (techToRemove: string) => {
    setTechStacks(prev => prev.filter(tech => tech !== techToRemove));
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack();
    }
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 백엔드 정규식에 맞춰 영문, 숫자, 공백, 점, 플러스, 샵, 하이픈만 허용
    value = value.replace(/[^\w .+#-]/g, '');
    
    // 최대 길이 제한
    if (value.length > 30) {
      value = value.substring(0, 30);
    }
    
    setCurrentTech(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 유효성 검사
      if (!formData.title.trim()) {
        toast.error('프로젝트 제목을 입력해주세요.');
        return;
      }
      
      if (formData.title.trim().length < 1 || formData.title.trim().length > 200) {
        toast.error('프로젝트 제목은 1글자 이상 200글자 이하로 입력해주세요.');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('프로젝트 설명을 입력해주세요.');
        return;
      }

      if (formData.description.trim().length < 1 || formData.description.trim().length > 2000) {
        toast.error('프로젝트 설명은 1글자 이상 2000글자 이하로 입력해주세요.');
        return;
      }

      if (techStacks.length === 0) {
        toast.error('최소 1개 이상의 기술 스택을 추가해주세요.');
        return;
      }

      // 모든 기술 스택 재검증
      for (const tech of techStacks) {
        const error = validateTechStack(tech);
        if (error && !error.includes('이미 추가된')) { // 중복 체크는 제외
          toast.error(`기술 스택 "${tech}"에 문제가 있습니다: ${error}`);
          return;
        }
      }

      const techStackString = techStacks.join(', ');
      console.log('🔍 [Debug] TechStack 전송 데이터:', JSON.stringify(techStackString));
      console.log('🔍 [Debug] TechStack 길이:', techStackString.length);
      console.log('🔍 [Debug] TechStack 배열:', techStacks);
      
      if (techStackString.length > 500) {
        toast.error('기술 스택은 총 500자를 초과할 수 없습니다.');
        return;
      }

      const teamSizeNum = parseInt(formData.teamSize);
      if (!formData.teamSize || isNaN(teamSizeNum) || teamSizeNum < 1) {
        toast.error('팀원 수는 1명 이상으로 입력해주세요.');
        return;
      }

      const durationNum = parseInt(formData.durationWeeks);
      if (!formData.durationWeeks || isNaN(durationNum) || durationNum < 1) {
        toast.error('예상 기간은 1주 이상으로 입력해주세요.');
        return;
      }

      const requestData: ProjectCreateRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        techStack: techStackString,
        teamSize: teamSizeNum,
        durationWeeks: durationNum,
      };

      console.log('📡 [Debug] 최종 요청 데이터:', JSON.stringify(requestData, null, 2));

      const newProject = await projectApi.createProject(requestData);
      console.log('프로젝트 생성 성공:', newProject);
      
      toast.success('프로젝트가 성공적으로 생성되었습니다!', {
        description: '프로젝트 페이지로 이동합니다.',
        duration: 3000
      });
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      toast.error('프로젝트 생성에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-gradient-to-br from-purple-100 to-blue-100 p-8">
              <CardTitle className="text-4xl font-black flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                새 프로젝트 생성
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="title" className="text-lg font-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    프로젝트 제목
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="프로젝트 제목을 입력하세요 (1-200글자)"
                    required
                    minLength={1}
                    maxLength={200}
                    className="border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 font-medium text-lg p-4"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="description" className="text-lg font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    프로젝트 설명
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="프로젝트에 대한 자세한 설명을 입력하세요 (1-2000글자)"
                    required
                    minLength={1}
                    maxLength={2000}
                    rows={6}
                    className="border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 font-medium text-base p-4 resize-none"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="techStack" className="text-lg font-black flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-green-600" />
                    기술 스택
                  </Label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Input
                        id="techStack"
                        value={currentTech}
                        onChange={handleTechChange}
                        onKeyPress={handleTechKeyPress}
                        placeholder="기술 스택을 입력하고 Enter를 누르세요 (예: React, Node.js, C#, .NET)"
                        maxLength={30}
                        className="flex-1 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 font-medium p-4"
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          type="button" 
                          onClick={addTechStack}
                          disabled={!currentTech.trim()}
                          className="bg-green-500 hover:bg-green-600 text-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="mr-2 h-5 w-5" />
                          추가
                        </Button>
                      </motion.div>
                    </div>
                    {techStacks.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-3 p-4 border-3 border-black rounded-xl bg-gradient-to-br from-green-50 to-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                      >
                        {techStacks.map((tech, index) => (
                          <motion.div
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                            className="relative"
                          >
                            <Badge className="bg-gradient-to-r from-blue-400 to-purple-400 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-4 py-2 pr-10">
                              {tech}
                              <motion.button
                                type="button"
                                onClick={() => removeTechStack(tech)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    {techStacks.length === 0 && (
                      <div className="p-4 border-3 border-gray-300 border-dashed rounded-xl bg-gray-50">
                        <p className="font-bold text-gray-600 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          기술 스택을 추가해주세요.
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p className="font-medium">• 영문, 숫자, 공백, 하이픈(-), 점(.), 플러스(+), 샵(#)만 사용 가능</p>
                          <p className="font-medium">• 1-30글자 제한</p>
                          <p className="font-medium">• 예: React, Node.js, TypeScript, C#, F#, C++, .NET</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="teamSize" className="text-lg font-black flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      팀원 수
                    </Label>
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      value={formData.teamSize}
                      onChange={handleChange}
                      placeholder="필요한 팀원 수 (1명 이상)"
                      required
                      min="1"
                      className="border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 font-bold text-lg p-4"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="durationWeeks" className="text-lg font-black flex items-center gap-2">
                      <Clock className="w-5 h-5 text-pink-600" />
                      예상 기간 (주)
                    </Label>
                    <Input
                      id="durationWeeks"
                      name="durationWeeks"
                      type="number"
                      value={formData.durationWeeks}
                      onChange={handleChange}
                      placeholder="예상 진행 기간 (1주 이상)"
                      required
                      min="1"
                      className="border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 font-bold text-lg p-4"
                    />
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between items-center pt-6 border-t-4 border-black"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="bg-white hover:bg-gray-100 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-6 py-3"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      취소
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Zap className="h-5 w-5" />
                          </motion.div>
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          프로젝트 생성
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
