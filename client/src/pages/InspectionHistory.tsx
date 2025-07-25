import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import AppHeader from "@/components/layout/AppHeader";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { FileText, Search, Filter, Calendar, Building, User } from "lucide-react";

export default function InspectionHistory() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const { data: inspections, isLoading } = useQuery({
    queryKey: ["/api/inspections"],
  });

  const { data: sites } = useQuery({
    queryKey: ["/api/sites"],
  });

  const { data: inspectors } = useQuery({
    queryKey: ["/api/inspectors"],
  });

  const filteredInspections = (inspections || []).filter((inspection: any) => {
    const matchesSearch = !searchQuery || 
      inspection.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.facilityManager?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "date":
        return new Date(b.inspectionDate || 0).getTime() - new Date(a.inspectionDate || 0).getTime();
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      case "progress":
        return (b.progress || 0) - (a.progress || 0);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">완료</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">진행중</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">대기</Badge>;
    }
  };

  const getSiteInfo = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.contractorName : "현장 정보 없음";
  };

  const getInspectorInfo = (inspectorId: number) => {
    const inspector = inspectors?.find((i: any) => i.id === inspectorId);
    return inspector ? inspector.name : "점검자 미정";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onMenuClick={() => setDrawerOpen(true)} title="점검 이력" />
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <main className="p-4 pb-6">
        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              검색 및 필터
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="문서번호 또는 관리자명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="draft">진행중</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">날짜순</SelectItem>
                  <SelectItem value="status">상태순</SelectItem>
                  <SelectItem value="progress">진행률순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inspections List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInspections.length > 0 ? (
          <div className="space-y-4">
            {filteredInspections.map((inspection: any) => (
              <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {inspection.documentNumber || `점검-${inspection.id.slice(0, 8)}`}
                        </h3>
                        {getStatusBadge(inspection.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {inspection.inspectionDate 
                              ? new Date(inspection.inspectionDate).toLocaleDateString() 
                              : "날짜 미정"}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{getSiteInfo(inspection.siteId)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{getInspectorInfo(inspection.inspectorId)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary mb-1">
                        {inspection.progress || 0}% 완료
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${inspection.progress || 0}%` }}
                        ></div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inspection/${inspection.id}`}>
                          보기
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  {inspection.summary && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {inspection.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                점검 기록이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                검색 조건에 맞는 점검 기록을 찾을 수 없습니다.
              </p>
              <Button asChild>
                <Link href="/new-inspection">
                  새 점검 시작하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
