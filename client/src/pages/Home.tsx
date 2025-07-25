import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import AppHeader from "@/components/layout/AppHeader";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { PlusCircle, FileText, Building, Users, Mail, TrendingUp, Edit } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { isDemoMode, getApiPath } = useDemoMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: inspections } = useQuery({
    queryKey: [getApiPath("/inspections")],
  });

  const { data: sites } = useQuery({
    queryKey: [getApiPath("/sites")],
  });

  const { data: inspectors } = useQuery({
    queryKey: [getApiPath("/inspectors")],
  });

  const recentInspections = inspections?.slice(0, 5) || [];
  const totalInspections = inspections?.length || 0;
  const completedInspections = inspections?.filter((i: any) => i.status === 'completed').length || 0;
  const draftInspections = inspections?.filter((i: any) => i.status === 'draft').length || 0;

  // Find the most recently used inspector from recent inspections
  const getRecentInspectorName = () => {
    if (!inspections || !inspectors || inspections.length === 0 || inspectors.length === 0) {
      return inspectors && inspectors.length > 0 ? inspectors[0].name : '점검자';
    }
    
    // Get the most recent inspection with an inspector ID
    const recentInspectionWithInspector = inspections
      .filter((inspection: any) => inspection.inspectorId)
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
    
    if (recentInspectionWithInspector) {
      const inspector = inspectors.find((insp: any) => insp.id === recentInspectionWithInspector.inspectorId);
      if (inspector) {
        return inspector.name;
      }
    }
    
    // Fallback to first inspector if no recent inspection found
    return inspectors.length > 0 ? inspectors[0].name : '점검자';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onMenuClick={() => setDrawerOpen(true)} />
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <main className="pb-6">
        {/* Welcome Section */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-responsive-xl font-normal mb-2">
                안녕하세요, {isDemoMode ? '테스터' : getRecentInspectorName()}님!
              </h2>
              <p className="text-blue-100 text-responsive">
                오늘도 안전한 점검 작업을 시작해보세요.
              </p>
            </div>
            <div className="px-3 py-2">
              <span className="text-white font-semibold text-responsive-2xl">KD NAVIEN</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalInspections}</div>
                <div className="text-sm text-gray-600">총 점검</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completedInspections}</div>
                <div className="text-sm text-gray-600">완료</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{draftInspections}</div>
                <div className="text-sm text-gray-600">진행중</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{sites?.length || 0}</div>
                <div className="text-sm text-gray-600">현장</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                빠른 작업
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href={isDemoMode ? "/demo/new-inspection" : "/new-inspection"}>
                  <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                    <PlusCircle className="w-6 h-6" />
                    <span className="btn-text-responsive">새 점검</span>
                  </Button>
                </Link>
                <Link href={isDemoMode ? "/demo/inspection-history" : "/inspection-history"}>
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                    <FileText className="w-6 h-6" />
                    <span className="btn-text-responsive">점검 이력</span>
                  </Button>
                </Link>
                <Link href={isDemoMode ? "/demo/site-management" : "/site-management"}>
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                    <Building className="w-6 h-6" />
                    <span className="btn-text-responsive">현장 관리</span>
                  </Button>
                </Link>
                <Link href={isDemoMode ? "/demo/inspector-management" : "/inspector-management"}>
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                    <Users className="w-6 h-6" />
                    <span className="btn-text-responsive">점검자 관리</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>최근 점검</CardTitle>
              <CardDescription>최근 진행된 점검 작업들</CardDescription>
            </CardHeader>
            <CardContent>
              {recentInspections.length > 0 ? (
                <div className="space-y-3">
                  {recentInspections.map((inspection: any) => (
                    <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{inspection.documentNumber || '문서번호 없음'}</div>
                        <div className="text-sm text-gray-600">
                          {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : '날짜 미정'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`text-sm px-2 py-1 rounded ${
                            inspection.status === 'completed' ? 'bg-green-100 text-green-800' :
                            inspection.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inspection.status === 'completed' ? '완료' :
                             inspection.status === 'draft' ? '진행중' : '대기'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {inspection.progress || 0}% 완료
                          </div>
                        </div>
                        {/* 본인 작성 점검만 수정 가능 */}
                        {inspection.createdBy === user?.id && (
                          <Link href={`${isDemoMode ? '/demo' : ''}/new-inspection?edit=${inspection.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <Edit className="w-4 h-4" />
                              <span>수정</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>아직 점검 기록이 없습니다.</p>
                  <p className="text-sm">첫 번째 점검을 시작해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
