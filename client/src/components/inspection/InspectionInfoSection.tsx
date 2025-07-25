import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import ProductListSection from "./ProductListSection";

interface InspectionInfoSectionProps {
  form: UseFormReturn<any>;
  inspectors: any[];
}

export default function InspectionInfoSection({ form, inspectors }: InspectionInfoSectionProps) {
  // Generate 1차 to 100차 options
  const visitCountOptions = Array.from({ length: 100 }, (_, i) => `${i + 1}차`);
  const resultOptions = [
    { value: "정상", label: "정상", color: "text-green-600" },
    { value: "주의", label: "주의", color: "text-yellow-600" },
    { value: "불량", label: "불량", color: "text-red-600" },
    { value: "점검 필요", label: "점검 필요", color: "text-orange-600" },
  ];
  
  const inspectorOptions = [
    "이엔지", "시공기", "정책기", "에치엔"
  ];

  // 사용년수 자동 계산 함수
  const calculateUsageYears = (installDate: string): string => {
    if (!installDate) return '';
    
    const install = new Date(installDate);
    const now = new Date();
    
    let years = now.getFullYear() - install.getFullYear();
    let months = now.getMonth() - install.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return months === 0 ? '1개월 미만' : `${months}개월`;
    } else if (months === 0) {
      return `${years}년`;
    } else {
      return `${years}년 ${months}개월`;
    }
  };

  return (
    <Card className="m-4 shadow-sm border">
      <CardHeader className="p-4 border-b bg-blue-50">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Search className="w-5 h-5 text-primary mr-2" />
          점검 정보
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>문서번호</FormLabel>
                <FormControl>
                  <Input placeholder="문서번호 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visitCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>방문차수</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {visitCountOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inspectionDate"
            render={({ field }) => {
              // Format date for display (YY.MM.DD)
              const formatDateForDisplay = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const year = date.getFullYear().toString().slice(-2);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}.${month}.${day}`;
              };

              // Convert display format back to ISO date
              const parseDisplayDate = (displayStr: string) => {
                if (!displayStr) return '';
                const parts = displayStr.split('.');
                if (parts.length !== 3) return '';
                const year = `20${parts[0]}`;
                const month = parts[1];
                const day = parts[2];
                return `${year}-${month}-${day}`;
              };

              return (
                <FormItem>
                  <FormLabel>점검일</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="25.06.01"
                        value={formatDateForDisplay(field.value || '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and dots
                          const cleaned = value.replace(/[^\d.]/g, '');
                          
                          // Auto-format as user types
                          let formatted = cleaned;
                          if (cleaned.length >= 2 && !cleaned.includes('.')) {
                            formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
                          }
                          if (cleaned.length >= 5 && cleaned.split('.').length === 2) {
                            const parts = cleaned.split('.');
                            formatted = parts[0] + '.' + parts[1].slice(0, 2) + '.' + parts[1].slice(2);
                          }
                          
                          // Update display
                          e.target.value = formatted;
                          
                          // Convert to ISO format for form
                          if (formatted.length === 8) { // YY.MM.DD
                            const isoDate = parseDisplayDate(formatted);
                            field.onChange(isoDate);
                          } else {
                            field.onChange('');
                          }
                        }}
                        onBlur={() => {
                          // Ensure proper format on blur
                          const formatted = formatDateForDisplay(field.value || '');
                          if (formatted) {
                            field.onChange(parseDisplayDate(formatted));
                          }
                        }}
                        className="pr-10"
                      />
                      <input
                        type="date"
                        className="absolute right-0 top-0 w-full h-full opacity-0 cursor-pointer"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="inspectorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>점검자</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="점검자 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {inspectors.length > 0 ? (
                      inspectors.map((inspector) => (
                        <SelectItem key={inspector.id} value={inspector.id.toString()}>
                          {inspector.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-inspectors" disabled>
                        등록된 점검자가 없습니다
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 설치제품 및 대수 - 점검일/점검자 바로 아래 배치 */}
        <ProductListSection form={form} />

        {/* 설치일/사용년수 - 설치제품 바로 아래 배치 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="installationDate"
            render={({ field }) => {
              // Format date for display (YY.MM.DD)
              const formatDateForDisplay = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const year = date.getFullYear().toString().slice(-2);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}.${month}.${day}`;
              };

              // Convert display format back to ISO date
              const parseDisplayDate = (displayStr: string) => {
                if (!displayStr) return '';
                const parts = displayStr.split('.');
                if (parts.length !== 3) return '';
                const year = `20${parts[0]}`;
                const month = parts[1];
                const day = parts[2];
                return `${year}-${month}-${day}`;
              };

              return (
                <FormItem>
                  <FormLabel>설치일</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="25.06.01"
                        value={formatDateForDisplay(field.value || '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and dots
                          const cleaned = value.replace(/[^\d.]/g, '');
                          
                          // Auto-format as user types
                          let formatted = cleaned;
                          if (cleaned.length >= 2 && !cleaned.includes('.')) {
                            formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
                          }
                          if (cleaned.length >= 5 && cleaned.split('.').length === 2) {
                            const parts = cleaned.split('.');
                            formatted = parts[0] + '.' + parts[1].slice(0, 2) + '.' + parts[1].slice(2);
                          }
                          
                          // Limit total length
                          if (formatted.length > 8) {
                            formatted = formatted.slice(0, 8);
                          }
                          
                          // Update display
                          e.target.value = formatted;
                          
                          // Convert to ISO format for form
                          if (formatted.length === 8) { // YY.MM.DD
                            const isoDate = parseDisplayDate(formatted);
                            field.onChange(isoDate);
                          } else {
                            field.onChange('');
                          }
                        }}
                        onBlur={() => {
                          // Ensure proper format on blur
                          const formatted = formatDateForDisplay(field.value || '');
                          if (formatted) {
                            field.onChange(parseDisplayDate(formatted));
                          }
                        }}
                        className="pr-10"
                      />
                      <input
                        type="date"
                        className="absolute right-0 top-0 w-full h-full opacity-0 cursor-pointer"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="installationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사용년수</FormLabel>
                <FormControl>
                  <Input 
                    value={calculateUsageYears(field.value || '')}
                    readOnly
                    placeholder="자동 계산"
                    className="bg-gray-50 text-gray-700"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>점검결과</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="결과 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resultOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilityManager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시설관리자</FormLabel>
                <FormControl>
                  <Input placeholder="관리자명 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>점검결과요약</FormLabel>
              <FormControl>
                <Textarea 
                  rows={3} 
                  placeholder="점검 결과 요약을 입력하세요..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
