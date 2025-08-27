'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getApplication } from '@/lib/api/application';
import { ApplicationDetailResponseDto } from '@/types';

interface ApplicationDetailsModalProps {
  applicationId: number;
  open: boolean;
  onClose: () => void;
}

export function ApplicationDetailsModal({ 
  applicationId, 
  open, 
  onClose
}: ApplicationDetailsModalProps) {
  const [application, setApplication] = useState<ApplicationDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getApplication(applicationId);
      setApplication(result);
      
    } catch (err) {
      console.error('지원서 상세정보 조회 실패:', err);
      setError('지원서 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (open && applicationId) {
      fetchApplicationDetails();
    }
  }, [open, applicationId, fetchApplicationDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return '승인됨';
      case 'REJECTED': return '거절됨';
      case 'PENDING': return '검토중';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-300 shadow-xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold">지원서 상세 정보</DialogTitle>
          <DialogDescription>
            지원자의 상세 정보와 지원 내용을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">지원서 정보를 불러오는 중...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : application ? (
          <div className="space-y-6 py-4">
            {/* 지원 상태 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">지원 상태</h3>
              <Badge className={`px-3 py-1 ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </Badge>
            </div>

            {/* 지원자 정보 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">👤 지원자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">닉네임</p>
                    <p className="font-medium">{application.nickname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">지원서 ID</p>
                    <p className="font-medium">#{application.applicationId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 기술별 점수 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">⭐ 기술별 점수</CardTitle>
              </CardHeader>
              <CardContent>
                {application.techName && application.techName.length > 0 && application.score && application.score.length > 0 ? (
                  <div className="space-y-3">
                    {application.techName.map((techName, index) => {
                      const score = application.score[index] || 0;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium text-gray-800">{techName}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[...Array(10)].map((_, dotIndex) => (
                                <div
                                  key={dotIndex}
                                  className={`w-3 h-3 rounded-full ${
                                    dotIndex < score 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-green-700 ml-2">
                              {score}/10
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">등록된 기술 점수가 없습니다.</p>
                )}
              </CardContent>
            </Card>

            {/* 지원 일시 */}
            <div className="text-sm text-gray-600 text-center border-t pt-4">
              지원일시: {new Date(application.appliedAt).toLocaleString('ko-KR')}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
                닫기
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}