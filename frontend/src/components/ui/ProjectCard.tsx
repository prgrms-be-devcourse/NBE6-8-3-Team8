import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Code2, Clock, Sparkles, Zap } from 'lucide-react';
import type { ProjectDetailResponse } from '@/types';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: ProjectDetailResponse;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  // 기술 스택을 배열로 변환 (백엔드에서 이미 배열로 반환)
  const techStackArray = Array.isArray(project.techStacks) 
    ? project.techStacks 
    : [];

  // 상태별 색상 및 텍스트
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECRUITING': return 'bg-green-400 text-black';
      case 'IN_PROGRESS': return 'bg-blue-400 text-black';
      case 'COMPLETED': return 'bg-gray-400 text-black';
      default: return 'bg-gray-400 text-black';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      default: return status;
    }
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-200 transform relative overflow-hidden group">
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
        />
      <CardHeader className="border-b-4 border-black bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex justify-between items-start mb-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Badge className={`${getStatusColor(project.status)} border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold px-3 py-1 transition-all duration-200`}>
              {project.status === 'RECRUITING' && <Sparkles className="w-3 h-3 mr-1" />}
              {getStatusText(project.status)}
            </Badge>
          </motion.div>
        </div>
        <CardTitle className="text-xl line-clamp-2 font-black text-gray-900">
          {project.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-gray-700 font-medium">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* 기술 스택 */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
            <Code2 className="w-4 h-4 text-purple-600" />
            <span>기술 스택</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStackArray.slice(0, 3).map((tech: string, index: number) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, rotate: [-1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Badge className="text-xs bg-purple-100 text-purple-800 border-2 border-purple-300 font-bold hover:bg-purple-200 transition-colors duration-200">
                  {tech}
                </Badge>
              </motion.div>
            ))}
            {techStackArray.length > 3 && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="text-xs bg-gray-100 text-gray-800 border-2 border-gray-300 font-bold hover:bg-gray-200 transition-colors duration-200">
                  +{techStackArray.length - 3}
                </Badge>
              </motion.div>
            )}
          </div>
        </div>

        {/* 팀 구성 진행률 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>팀원 모집 현황</span>
            </div>
            <span className="text-purple-600">{project.currentTeamSize}/{project.teamSize}명</span>
          </div>
          <Progress 
            value={(project.currentTeamSize / project.teamSize) * 100} 
            showPercentage 
            indicatorColor="bg-gradient-to-r from-orange-400 to-yellow-400"
          />
        </div>

        {/* 프로젝트 정보 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 font-bold text-gray-700">
            <Users className="w-4 h-4 text-orange-500" />
            <span>{project.creator}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-gray-700">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t-4 border-black bg-gradient-to-br from-orange-50 to-yellow-50">
        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            asChild 
            className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-black border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black py-6 text-base"
            onClick={onClick}
          >
            <Link href={`/projects/${project.id}`}>
              <Zap className="mr-2 h-5 w-5" />
              상세보기
            </Link>
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
    </motion.div>
  );
}

export default ProjectCard;
