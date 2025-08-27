'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface TechStackMatchRateProps {
  projectTechStacks: string[];
  userTechStacks: string[];
  userTechScores?: number[];
}

export function TechStackMatchRate({ 
  projectTechStacks, 
  userTechStacks, 
  userTechScores = [] 
}: TechStackMatchRateProps) {
  const [matchRate, setMatchRate] = useState(0);
  const [matchedStacks, setMatchedStacks] = useState<string[]>([]);
  const [unmatchedStacks, setUnmatchedStacks] = useState<string[]>([]);

  useEffect(() => {
    // 프로젝트 기술 스택과 사용자 기술 스택 비교
    const projectStacksLower = projectTechStacks.map(stack => stack.toLowerCase().trim());
    const userStacksLower = userTechStacks.map(stack => stack.toLowerCase().trim());
    
    const matched = projectStacksLower.filter(stack => userStacksLower.includes(stack));
    const unmatched = projectStacksLower.filter(stack => !userStacksLower.includes(stack));
    
    // 매칭률 계산
    const rate = projectStacksLower.length > 0 
      ? (matched.length / projectStacksLower.length) * 100 
      : 0;
    
    setMatchRate(Math.round(rate));
    setMatchedStacks(matched.map(stack => {
      const index = projectStacksLower.indexOf(stack);
      return projectTechStacks[index];
    }));
    setUnmatchedStacks(unmatched.map(stack => {
      const index = projectStacksLower.indexOf(stack);
      return projectTechStacks[index];
    }));
  }, [projectTechStacks, userTechStacks]);

  // 매칭률에 따른 색상과 메시지
  const getMatchInfo = (rate: number) => {
    if (rate >= 80) {
      return {
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        message: '완벽한 매칭!',
        icon: <Zap className="w-5 h-5 text-green-600" />
      };
    } else if (rate >= 60) {
      return {
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        message: '좋은 매칭!',
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />
      };
    } else if (rate >= 40) {
      return {
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        message: '적절한 매칭',
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
      };
    } else {
      return {
        color: 'bg-gradient-to-r from-red-500 to-pink-500',
        message: '기술 스택 보완 권장',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    }
  };

  const matchInfo = getMatchInfo(matchRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 p-6 bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black flex items-center gap-2">
          {matchInfo.icon}
          나의 기술 스택 점수
        </h3>
      </div>

      {/* 내가 입력한 기술 스택 점수 */}
      {userTechStacks.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-gray-700">내 기술 스택 점수</h4>
          <div className="flex flex-wrap gap-2">
            {userTechStacks.map((stack, index) => {
              const score = userTechScores[index] || 0;
              const isMatched = projectTechStacks.some(
                pStack => pStack.toLowerCase().trim() === stack.toLowerCase().trim()
              );
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge className={`${
                    isMatched 
                      ? "bg-green-100 text-green-800 border-2 border-green-400" 
                      : "bg-blue-100 text-blue-800 border-2 border-blue-400"
                  } font-bold`}>
                    {stack} ({score}/10)
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 프로젝트에서 요구하는 기술 스택 */}
      {projectTechStacks.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-gray-700">프로젝트 요구 기술</h4>
          <div className="flex flex-wrap gap-2">
            {projectTechStacks.map((stack, index) => {
              const isMatched = userTechStacks.some(
                uStack => uStack.toLowerCase().trim() === stack.toLowerCase().trim()
              );
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge className={`${
                    isMatched 
                      ? "bg-green-100 text-green-800 border-2 border-green-400" 
                      : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                  } font-bold`}>
                    {stack} {isMatched ? "✓" : ""}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TechStackMatchRate;