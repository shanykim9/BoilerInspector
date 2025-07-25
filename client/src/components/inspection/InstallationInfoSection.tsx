import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface InstallationInfoSectionProps {
  form: UseFormReturn<any>;
  sites: any[];
}

export default function InstallationInfoSection({ form, sites }: InstallationInfoSectionProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");

  // 시/도 목록
  const provinces = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", 
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도", 
    "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
  ];

  // 시/군/구 매핑
  const districts: { [key: string]: string[] } = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    "인천광역시": ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    "세종특별자치시": ["세종시"],
    "경기도": ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "여주시", "연천군"],
    "강원도": ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
    "충청북도": ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군"],
    "충청남도": ["계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시", "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군"],
    "전라북도": ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
    "전라남도": ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    "경상북도": ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
    "경상남도": ["거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
    "제주특별자치도": ["제주시", "서귀포시"]
  };

  const businessTypes = [
    "아파트", "오피스텔", "상업시설", "공장", "학교", "병원", "기타"
  ];

  const products = [
    "NPW", "NHB", "NCB"
  ];

  const purposes = [
    "난방", "급탕", "난방+급탕", "기타"
  ];

  // Generate 1 to 100 unit count options
  const unitCountOptions = Array.from({ length: 100 }, (_, i) => `${i + 1}`);

  return (
    <Card className="m-4 shadow-sm border">
      <CardHeader className="p-4 border-b bg-green-50">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Settings className="w-5 h-5 text-green-600 mr-2" />
          설치 정보
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* 설치장소 영역 */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700 border-b pb-2">설치장소</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시/도</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      setSelectedProvince(value);
                      field.onChange(value);
                      // Reset district when province changes
                      form.setValue("district", "");
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="시/도 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
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
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시/군/구</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="시/군/구 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedProvince && districts[selectedProvince] ? (
                        districts[selectedProvince].map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-province" disabled>
                          먼저 시/도를 선택하세요
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="detailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세주소</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="동/로, 건물명, 호수 등 상세주소 입력"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>현장명</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="현장명 또는 건물명 입력"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 제품 목록은 별도 컴포넌트로 처리됨 */}

        {/* Technical Details Collapsible */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              type="button"
            >
              <span className="font-medium">기술적 세부사항</span>
              {isDetailsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4">
            {/* 첫 번째 행: 사용 연료, 연도 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 연료 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="연료 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LNG">LNG</SelectItem>
                        <SelectItem value="LPG">LPG</SelectItem>
                        <SelectItem value="기름">기름</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exhaustType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연도 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="연도 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="개별배기">개별배기</SelectItem>
                        <SelectItem value="공동배기">공동배기</SelectItem>
                        <SelectItem value="복합배기">복합배기</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 두 번째 행: 정격 전압, 배관 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="electrical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정격 전압 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="전압 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="110V">110V</SelectItem>
                        <SelectItem value="220V">220V</SelectItem>
                        <SelectItem value="380V">380V</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="piping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>배관 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="배관 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="엑셀">엑셀</SelectItem>
                        <SelectItem value="주름관">주름관</SelectItem>
                        <SelectItem value="PP">PP</SelectItem>
                        <SelectItem value="동관">동관</SelectItem>
                        <SelectItem value="STS">STS</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 세 번째 행: 수질 선택, 제어 방식 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수질 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="수질 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="상수도">상수도</SelectItem>
                        <SelectItem value="지하수">지하수</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="control"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제어 방식 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="제어 방식 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="룸콘">룸콘</SelectItem>
                        <SelectItem value="NCC">NCC</SelectItem>
                        <SelectItem value="중앙제어">중앙제어</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 네 번째 행: 설치 용도, 남품 형태 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설치 용도 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="용도 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="난방">난방</SelectItem>
                        <SelectItem value="급탕">급탕</SelectItem>
                        <SelectItem value="난방+급탕">난방+급탕</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>남품 형태 선택</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="남품 형태 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="개별">개별</SelectItem>
                        <SelectItem value="단납">단납</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
