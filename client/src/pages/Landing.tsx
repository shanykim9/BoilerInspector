import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Mail, Settings } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            보일러 점검 관리 시스템
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            효율적인 보일러 점검과 관리를 위한 모바일 최적화 솔루션
          </p>
          <Button onClick={handleLogin} size="lg" className="px-8 py-3">
            시작하기
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">체계적 점검</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                표준화된 체크리스트를 통한 체계적인 점검 관리
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">PDF 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                점검 결과를 전문적인 PDF 보고서로 자동 생성
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">이메일 발송</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                점검 보고서를 관련자들에게 자동으로 이메일 발송
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <Settings className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">통합 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                점검자, 현장, 이력을 한 곳에서 통합 관리
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>주요 기능</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>모바일 최적화 점검 양식</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>자동 저장 및 진행률 표시</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>현장 사진 첨부</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>점검 이력 관리</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>전문적인 PDF 보고서 생성</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>이메일 자동 발송</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
