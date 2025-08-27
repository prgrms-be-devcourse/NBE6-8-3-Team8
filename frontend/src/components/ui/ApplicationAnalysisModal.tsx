'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnalysisResultResponse } from '@/types';

interface ApplicationAnalysisModalProps {
  applicationId: number;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  isAlreadyApplied?: boolean; // 이미 지원된 상태인지 구분
}

export function ApplicationAnalysisModal({ 
  applicationId, 
  open, 
  onClose, 
  onConfirm, 
  onCancel,
  isAlreadyApplied = false
}: ApplicationAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysisData = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devmatch-production-cf16.up.railway.app';
    
    try {
      setLoading(true);
      setError(null);
      
      // AI 분석 결과 조회 - 실제 백엔드 API 호출
      try {
        const response = await fetch(`${apiUrl}/analysis/application/${applicationId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        const analysisData = result.data;
        
        // 백엔드 응답을 프론트엔드 구조로 변환
        const transformedAnalysis: AnalysisResultResponse = {
          id: analysisData.id,
          applicationId: analysisData.applicationId,
          compatibilityScore: Number(analysisData.compatibilityScore),
          compatibilityReason: analysisData.compatibilityReason
        };
        
        setAnalysis(transformedAnalysis);
        
      } catch (analysisError) {
        console.warn('AI 분석 결과 조회 실패, 분석 생성 시도:', analysisError);
        
        // 분석 결과가 없으면 생성 시도
        try {
          const createResponse = await fetch(`${apiUrl}/analysis/application/${applicationId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!createResponse.ok) {
            throw new Error(`HTTP ${createResponse.status}`);
          }
          
          const createResult = await createResponse.json();
          const newAnalysisData = createResult.data;
          
          const transformedAnalysis: AnalysisResultResponse = {
            id: newAnalysisData.id,
            applicationId: newAnalysisData.applicationId,
            compatibilityScore: Number(newAnalysisData.compatibilityScore),
            compatibilityReason: newAnalysisData.compatibilityReason
          };
          
          setAnalysis(transformedAnalysis);
          
        } catch (createError) {
          console.error('AI 분석 생성 실패:', createError);
          throw createError; // 외부 catch로 전달
        }
      }
      
    } catch (err) {
      console.error('분석 데이터 조회/생성 실패:', err);
      setError('AI 분석 결과를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (open && applicationId) {
      fetchAnalysisData();
    }
  }, [open, applicationId, fetchAnalysisData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return '매우 적합';
    if (score >= 60) return '적합';
    if (score >= 40) return '보통';
    return '부족';
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto overflow-x-hidden bg-white border border-gray-300 shadow-xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold">지원서 AI 분석 결과</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>입력하신 기술 스택을 바탕으로 AI가 프로젝트 적합도를 분석했습니다.</p>
              {!isAlreadyApplied && (
                <p className="text-orange-600 font-medium">⚠️ 아직 지원이 완료되지 않았습니다. AI 분석 결과를 확인 후 최종 지원 여부를 결정해주세요.</p>
              )}
              {isAlreadyApplied && (
                <p className="text-green-600 font-medium">✅ 이미 지원이 완료된 프로젝트의 AI 분석 결과입니다.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">AI가 지원서를 분석하고 있습니다...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6 py-4">
            {/* 적합도 점수 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">프로젝트 적합도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.compatibilityScore)}`}>
                      {analysis.compatibilityScore}점
                    </div>
                    <div>
                      <p className="text-lg font-medium">{getScoreDescription(analysis.compatibilityScore)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 분석 의견 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">🤖 AI 분석 의견</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{analysis.compatibilityReason}</p>
                </div>
              </CardContent>
            </Card>

            {/* 최종 결정 - 아직 지원하지 않은 경우에만 표시 */}
            {!isAlreadyApplied && (
              <>
                <Card className="border border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">📋 최종 지원 결정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-orange-700 font-medium">
                        AI 분석 결과를 확인하셨나요? 이 프로젝트에 최종적으로 지원하시겠습니까?
                      </p>
                      <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
                        <p className="text-sm text-yellow-800 break-words">
                          <strong>⚠️ 주의:</strong> &quot;지원 확정&quot; 버튼을 누르면 실제로 지원서가 제출됩니다. 
                          &quot;지원 취소&quot;를 선택하면 임시 지원서가 삭제되고 지원이 취소됩니다.
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3">
                        <p className="text-sm text-blue-800 break-words">
                          <strong>💡 참고:</strong> 지원 확정 후에는 프로젝트 생성자가 검토하여 승인/거절을 결정합니다. 
                          AI 분석 결과는 참고용이며, 최종 결정은 생성자가 내립니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 확인 버튼 */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={onCancel} className="border-red-300 text-red-600 hover:bg-red-50">
                    ❌ 지원 취소 (임시 지원서 삭제)
                  </Button>
                  <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
                    ✅ 지원 확정 (실제 지원서 제출)
                  </Button>
                </div>
              </>
            )}

            {/* 이미 지원한 경우 - 닫기 버튼만 표시 */}
            {isAlreadyApplied && (
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                  닫기
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}