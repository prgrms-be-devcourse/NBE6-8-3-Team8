'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TechStackMatchRate } from '@/components/ui/TechStackMatchRate';
import { ProjectDetailResponse } from '@/types';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ProjectApplyModalProps {
  project: ProjectDetailResponse;
  onApply: (techStacks: string[], techScores: number[]) => Promise<void>;
  isApplying: boolean;
  children: React.ReactNode;
}

export function ProjectApplyModal({ project, onApply, isApplying, children }: ProjectApplyModalProps) {
  const [open, setOpen] = useState(false);
  const [techScores, setTechScores] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 프로젝트의 기술 스택을 배열로 변환 (백엔드에서 이미 배열로 반환)
  const projectTechStacks = Array.isArray(project.techStacks) 
    ? project.techStacks 
    : [];

  const handleScoreSelect = (tech: string, score: number) => {
    setTechScores(prev => ({
      ...prev,
      [tech]: score
    }));

    // 점수를 선택했으므로 에러 제거
    setErrors(prev => ({
      ...prev,
      [tech]: ''
    }));
  };

  // 모든 기술 스택에 점수가 입력되었는지 확인
  const isAllScoresSelected = projectTechStacks.every((tech: string) => {
    const score = techScores[tech];
    return score && score >= 1 && score <= 10;
  });

  const handleSubmit = async () => {
    // 모든 기술 스택에 대한 점수 선택 여부 확인
    const newErrors: { [key: string]: string } = {};
    let hasErrors = false;

    projectTechStacks.forEach((tech: string) => {
      const score = techScores[tech];
      if (!score || score < 1 || score > 10) {
        newErrors[tech] = '점수를 선택해주세요.';
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    try {
      const techStacksArray = projectTechStacks;
      const techScoresArray = projectTechStacks.map((tech: string) => techScores[tech] || 0);
      
      await onApply(techStacksArray, techScoresArray);
      setOpen(false);
      setTechScores({});
      setErrors({});
    } catch (error) {
      console.error('지원 중 에러:', error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setTechScores({});
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={isApplying ? undefined : setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-xl">
        <DialogHeader className="pb-4 border-b-4 border-black bg-gradient-to-br from-purple-100 to-blue-100 -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-2xl font-black">프로젝트 지원하기</DialogTitle>
          <DialogDescription className="font-medium text-gray-700">
            프로젝트에 필요한 기술 스택에 대한 자가 평가를 진행하고 지원서를 제출합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* 프로젝트 정보 */}
          <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardTitle className="text-xl font-black">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-700 font-medium mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {projectTechStacks.map((tech: string, index: number) => (
                  <Badge key={index} className="bg-gradient-to-r from-purple-400 to-blue-400 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 점수 기준 설명 */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">점수 기준 (자세히)</CardTitle>
              <p className="text-sm text-gray-600">
                아래 기준을 참고하여 정확하게 평가해주세요. 과대평가는 프로젝트에 방해가 될 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="font-bold text-red-800">1-2점: 초보자</div>
                    <div className="text-sm text-red-700 mt-1">
                      • 기술을 들어본 적이 있지만 실제 사용 경험이 거의 없음<br/>
                      • 기본 문법이나 개념을 이해하지 못함<br/>
                      • 튜토리얼을 따라하는 수준
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div className="font-bold text-orange-800">3-4점: 기본 이해</div>
                    <div className="text-sm text-orange-700 mt-1">
                      • 기본 문법과 개념을 이해함<br/>
                      • 간단한 예제나 과제를 완성할 수 있음<br/>
                      • 공식 문서를 보며 기본 기능 구현 가능
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="font-bold text-yellow-800">5-6점: 중급</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      • 실무나 개인 프로젝트에서 실제 사용 경험 있음<br/>
                      • 중간 복잡도의 기능을 독립적으로 구현 가능<br/>
                      • 라이브러리나 프레임워크의 핵심 기능 활용 가능
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="font-bold text-green-800">7-8점: 숙련자</div>
                    <div className="text-sm text-green-700 mt-1">
                      • 복잡한 기능과 아키텍처 설계 및 구현 가능<br/>
                      • 성능 최적화, 에러 처리, 테스트 작성 가능<br/>
                      • 팀 프로젝트에서 해당 기술 담당자 역할 수행 가능
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="font-bold text-blue-800">9-10점: 전문가</div>
                  <div className="text-sm text-blue-700 mt-1">
                    • 해당 기술의 고급 기능과 베스트 프랙티스를 숙지<br/>
                    • 복잡한 시스템 아키텍처 설계 및 기술적 의사결정 가능<br/>
                    • 다른 개발자에게 멘토링이 가능한 수준<br/>
                    • 기술 관련 문제 해결과 최적화에 전문성 보유
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 기술 스택 점수 선택 */}
          <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-gradient-to-br from-blue-50 to-purple-50">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                기술 스택 자가 평가
              </CardTitle>
              <p className="text-sm text-gray-700 font-medium mt-2">
                각 기술 스택에 대한 본인의 실력을 평가해주세요.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectTechStacks.map((tech: string, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-black text-lg">{tech}</Label>
                      {techScores[tech] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-3 py-1">
                            선택: {techScores[tech]}점
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <motion.div
                          key={score}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={techScores[tech] === score ? "default" : "outline"}
                            className={`h-10 w-full font-bold border-2 transition-all duration-200 ${
                              techScores[tech] === score 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                                : 'bg-white hover:bg-gray-100 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            }`}
                            onClick={() => handleScoreSelect(tech, score)}
                          >
                            {score}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    {errors[tech] && (
                      <p className="text-sm text-red-500">{errors[tech]}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 나의 기술 스택 점수 */}
          {Object.keys(techScores).length > 0 && (
            <TechStackMatchRate
              projectTechStacks={projectTechStacks}
              userTechStacks={Object.keys(techScores)}
              userTechScores={Object.values(techScores)}
            />
          )}

          {/* 제출 상태 및 안내 */}
          {!isAllScoresSelected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 border-4 border-amber-400 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(251,191,36,0.5)]"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-5 h-5 bg-amber-400 rounded-full border-2 border-black"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <p className="text-amber-800 font-black text-lg">
                  모든 기술 스택에 점수를 입력해주세요
                </p>
              </div>
              <p className="text-sm text-amber-700 font-medium mt-2">
                {projectTechStacks.length - Object.keys(techScores).length}개 기술 스택의 점수가 아직 입력되지 않았습니다.
              </p>
            </motion.div>
          )}

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t-4 border-black">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                disabled={isApplying}
                className="bg-white hover:bg-gray-100 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold px-6"
              >
                취소
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSubmit} 
                disabled={isApplying || !isAllScoresSelected} 
                className={`border-4 border-black font-bold px-6 transition-all duration-200 ${
                  isAllScoresSelected && !isApplying
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                }`}
              >
                {isApplying ? (
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <span>AI 분석 중...</span>
                  </div>
                ) : (
                  '지원하기'
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}