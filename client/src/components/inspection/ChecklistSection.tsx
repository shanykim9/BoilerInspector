import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChecklistSectionProps {
  form: UseFormReturn<any>;
}

const CHECKLIST_ITEMS = [
  { id: "1", question: "(설치) 제품 부착 상태는 이상 없는가?" },
  { id: "2", question: "(설치) 연도 설치 상태는 이상 없는가?" },
  { id: "3", question: "(설치) 가스관 연결 상태는 이상 없는가?" },
  { id: "4", question: "(설치) 수배관 연결 상태는 이상 없는가?" },
  { id: "5", question: "(설치) 전원선 연결 상태는 이상 없는가?" },
  { id: "6", question: "(설치) 응축수, 드레인 연결 상태는 이상 없는가?" },
  { id: "7", question: "(Check) 가동중 전압 공급 상태는 이상 없는가?" },
  { id: "8", question: "(Check) 가동중 가스 공급 상태는 이상 없는가?" },
  { id: "9", question: "(Check) 직수 공급 상태는 이상 없는가?" },
  { id: "10", question: "(Check) 수압 변동 상태는 이상 없는가? (외부 압력계)" },
  { id: "11", question: "(Check) 점화트랜스 상태는 이상 없는가?" },
  { id: "12", question: "(Check) 착화 상태는 이상 없는가?" },
  { id: "13", question: "(Check) 제품 내부 누수 상태는 이상 없는가?" },
  { id: "14", question: "(Check) 직수, 환수, 급기필터 상태는 이상이 없는가?" },
  { id: "15", question: "(Check) 송풍기 작동 상태는 이상이 없는가? (TEST모드)" },
  { id: "16", question: "(Check) 듀얼 벤츄리 상태는 이상이 없는가? (TEST모드)" },
  { id: "17", question: "(Check) 펌프 상태는 이상이 없는가? (TEST모드)" },
  { id: "18", question: "(Check) 유량조절밸브 상태는 이상이 없는가? (TEST모드)" },
  { id: "19", question: "(Check) 믹싱밸브 상태는 이상이 없는가? (TEST모드)" },
  { id: "20", question: "(Check) 삼방밸브 상태는 이상이 없는가? (TEST모드)" },
  { id: "21", question: "(Check) 전면 패널 상태는 이상 없는가? (TEST모드)" },
  { id: "22", question: "(Check) error history 발생 상태는 이상 없는가?" },
  { id: "23", question: "(Check) 연소성 측정 시 결과값은 이상 없는가?" }
];

export default function ChecklistSection({ form }: ChecklistSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const handleSetAllYes = () => {
    const updatedChecklist = CHECKLIST_ITEMS.map(item => ({
      id: item.id,
      question: item.question,
      answer: 'yes' as const,
      reason: ""  // 빈 문자열로 명시적 설정
    }));
    
    form.setValue('checklist', updatedChecklist);
    
    toast({
      title: "체크리스트 업데이트",
      description: "모든 항목이 '예'로 설정되었습니다",
      variant: "default",
    });
  };
  
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getChecklistValue = (itemId: string) => {
    const checklist = form.watch("checklist") || [];
    return checklist.find((item: any) => item.id === itemId);
  };

  const updateChecklistItem = (itemId: string, answer: 'yes' | 'no' | null, reason?: string) => {
    const currentChecklist = form.watch("checklist") || [];
    const existingIndex = currentChecklist.findIndex((item: any) => item.id === itemId);
    
    const checklistItem = CHECKLIST_ITEMS.find(item => item.id === itemId);
    if (!checklistItem) return;

    const updatedItem = {
      id: itemId,
      question: checklistItem.question,
      answer,
      reason: answer === 'no' ? (reason || "") : ""  // 항상 빈 문자열로 초기화
    };

    let updatedChecklist;
    if (existingIndex >= 0) {
      updatedChecklist = [...currentChecklist];
      updatedChecklist[existingIndex] = updatedItem;
    } else {
      updatedChecklist = [...currentChecklist, updatedItem];
    }

    form.setValue("checklist", updatedChecklist);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-600">
            <path d="M9 12l2 2 4-4" />
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">체크리스트</h3>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const checklistValue = getChecklistValue(item.id);
          const isExpanded = expandedItems.has(item.id);
          const hasAnswer = checklistValue?.answer;
          const showReason = checklistValue?.answer === 'no';

          return (
            <Card key={item.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {item.question}
                    </span>
                    {hasAnswer && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        checklistValue.answer === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {checklistValue.answer === 'yes' ? '예' : '아니오'}
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pl-7 space-y-4">
                    <RadioGroup
                      value={checklistValue?.answer || undefined}
                      onValueChange={(value) => {
                        updateChecklistItem(
                          item.id, 
                          value as 'yes' | 'no', 
                          checklistValue?.reason
                        );
                      }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                        <Label 
                          htmlFor={`${item.id}-yes`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          예
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`${item.id}-no`} />
                        <Label 
                          htmlFor={`${item.id}-no`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          아니오
                        </Label>
                      </div>
                    </RadioGroup>

                    {showReason && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          사유를 입력해주세요
                        </Label>
                        <Textarea
                          placeholder="아니오를 선택한 사유를 입력해주세요..."
                          value={checklistValue?.reason ?? ""}  // null/undefined 안전 처리
                          onChange={(e) => {
                            updateChecklistItem(
                              item.id,
                              'no',
                              e.target.value
                            );
                          }}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* 전체 Yes 버튼 */}
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSetAllYes}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
        >
          전체 Yes
        </Button>
      </div>
    </div>
  );
}