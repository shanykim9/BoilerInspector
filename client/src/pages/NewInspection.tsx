import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";

import AppHeader from "@/components/layout/AppHeader";
import NavigationDrawer from "@/components/layout/NavigationDrawer";

import InspectionInfoSection from "@/components/inspection/InspectionInfoSection";
import InstallationInfoSection from "@/components/inspection/InstallationInfoSection";
import ProductListSection from "@/components/inspection/ProductListSection";
import ChecklistSection from "@/components/inspection/ChecklistSection";
import PhotoUploadSection from "@/components/inspection/PhotoUploadSection";
import FloatingActionButtons from "@/components/inspection/FloatingActionButtons";
import ActionSheetModal from "@/components/inspection/ActionSheetModal";
import ToastNotification from "@/components/ui/toast-notification";

import { apiRequest, apiGet } from "@/lib/queryClient";
import { formatInspectionData } from "@/lib/inspectionUtils";
import { generateInspectionPDF } from "@/lib/pdfGenerator";
import { convertKoreanShortDate } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/hooks/useDemoMode";

const inspectionSchema = z.object({
  documentNumber: z.string().optional(),
  visitCount: z.string().optional(),
  inspectionDate: z.string().optional(),
  inspectorId: z.number().optional(),
  result: z.string().optional(),
  facilityManager: z.string().optional(),
  summary: z.string().optional(),
  contractorName: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  detailAddress: z.string().optional(),
  siteId: z.number().optional(),
  products: z.array(z.object({
    name: z.string(),
    count: z.number()
  })).optional(),
  fuel: z.string().optional(),
  exhaustType: z.string().optional(),
  electrical: z.string().optional(),
  piping: z.string().optional(),
  waterSupply: z.string().optional(),
  control: z.string().optional(),
  purpose: z.string().optional(),
  deliveryType: z.string().optional(),
  installationDate: z.string().optional(),
  checklist: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.enum(['yes', 'no']).nullable(),
    reason: z.string().optional(),
  })).optional(),
  status: z.string().optional(),
});

type InspectionForm = z.infer<typeof inspectionSchema>;

export default function NewInspection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");

  const { toast } = useToast();
  const { isDemoMode, getApiPath } = useDemoMode();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const search = useSearch();
  
  // URL에서 편집할 점검 ID 추출
  const editInspectionId = new URLSearchParams(search).get('edit');
  
  // 임시 ID 생성 (편집 모드가 아닌 경우에만)
  const [tempInspectionId] = useState(() => editInspectionId || uuidv4());

  // 편집할 점검 데이터 로드
  const { data: editInspection } = useQuery({
    queryKey: [getApiPath("/inspections"), editInspectionId],
    queryFn: () => editInspectionId ? apiGet(isDemoMode ? `/api/demo/inspections/${editInspectionId}` : `/api/inspections/${editInspectionId}`) : null,
    enabled: !!editInspectionId,
  });

  // Auto-save form data to localStorage
  const STORAGE_KEY = editInspectionId ? `inspection-form-edit-${editInspectionId}` : "inspection-form-draft";
  
  const form = useForm<InspectionForm>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      documentNumber: "",
      visitCount: "",
      inspectionDate: "",
      inspectorId: undefined,
      result: "",
      facilityManager: "",
      summary: "",
      contractorName: "",
      products: [],
      fuel: "",
      exhaustType: "",
      electrical: "",
      piping: "",
      waterSupply: "",
      control: "",
      purpose: "",
      deliveryType: "",
      installationDate: "",
      checklist: [],
      status: "draft",
    },
  });

  // Load saved form data or edit data on component mount
  useEffect(() => {
    if (editInspection) {
      // 편집 모드: 기존 점검 데이터로 폼 초기화
      const formData = {
        ...editInspection,
        inspectionDate: editInspection.inspectionDate ? 
          new Date(editInspection.inspectionDate).toISOString().split('T')[0] : "",
        products: editInspection.products || [],
        checklist: editInspection.checklist || [],
      };
      form.reset(formData);
      setCurrentInspectionId(editInspection.id);
      // 편집 모드 알림 제거
    } else {
      // 새 점검 모드: localStorage에서 임시 저장 데이터 불러오기
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          form.reset(parsedData);
          // 이전 입력 내용 불러오기 알림도 제거
        } catch (error) {
          console.error("Failed to load saved form data:", error);
        }
      }
    }
  }, [form, editInspection]);

  // Watch form changes and auto-save to localStorage (silent)
  const watchedValues = form.watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!editInspectionId) { // 편집 모드가 아닐 때만 localStorage에 저장
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
          // 자동저장 알림 제거 - 성공 시 조용히 저장
        } catch (error) {
          // 에러 상황에서만 알림 표시
          setAutoSaveStatus("저장 실패");
          setTimeout(() => setAutoSaveStatus(""), 3000);
          console.error("Failed to save to localStorage:", error);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, editInspectionId]);

  const { data: inspectors } = useQuery({
    queryKey: [getApiPath("/inspectors")],
  });

  const { data: sites } = useQuery({
    queryKey: [getApiPath("/sites")],
  });

  // Helper function to convert dates in form data
  const convertDatesInFormData = (data: InspectionForm) => {
    const converted = { ...data };
    
    // Convert inspection date
    if (converted.inspectionDate) {
      converted.inspectionDate = convertKoreanShortDate(converted.inspectionDate);
    }
    
    // Convert installation date
    if (converted.installationDate) {
      converted.installationDate = convertKoreanShortDate(converted.installationDate);
    }
    
    return converted;
  };

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (data: InspectionForm) => {
      const convertedData = convertDatesInFormData({
        ...data,
        id: tempInspectionId // 임시 ID 사용
      });
      const response = await apiRequest("POST", getApiPath("/inspections"), convertedData);
      return response.json();
    },
    onSuccess: (inspection) => {
      setCurrentInspectionId(inspection.id);
      queryClient.invalidateQueries({ queryKey: [getApiPath("/inspections")] });
    },
  });

  // Update inspection mutation
  const updateInspectionMutation = useMutation({
    mutationFn: async (data: InspectionForm) => {
      const targetId = editInspectionId || tempInspectionId;
      const convertedData = convertDatesInFormData(data);
      const apiPath = isDemoMode ? `/api/demo/inspections/${targetId}` : `/api/inspections/${targetId}`;
      const response = await apiRequest("PUT", apiPath, convertedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getApiPath("/inspections")] });
      // 자동저장 성공 시 알림 제거 - 조용히 저장
    },
    onError: (error) => {
      // 에러 상황에서만 알림 표시
      setAutoSaveStatus("저장 실패");
      setTimeout(() => setAutoSaveStatus(""), 3000);
      console.error("Auto-save failed:", error);
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (editInspectionId || tempInspectionId) {
        // Auto-save after 2 seconds of inactivity
        const timeoutId = setTimeout(() => {
          // Filter out incomplete products before saving
          const validProducts = (data.products || [])
            .filter((p): p is {name: string, count: number} => 
              p != null && 
              typeof p.name === 'string' && 
              p.name.length > 0 && 
              typeof p.count === 'number' && 
              p.count > 0
            );
          const cleanData = { ...data, products: validProducts };
          updateInspectionMutation.mutate(cleanData);
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, currentInspectionId, updateInspectionMutation]);

  const handleSaveDraft = () => {
    const data = form.getValues();
    // Filter out incomplete products before saving
    const validProducts = (data.products || [])
      .filter((p): p is {name: string, count: number} => 
        p != null && 
        typeof p.name === 'string' && 
        p.name.length > 0 && 
        typeof p.count === 'number' && 
        p.count > 0
      );
    const cleanData = { ...data, products: validProducts, status: "draft" };
    
    if (currentInspectionId) {
      updateInspectionMutation.mutate(cleanData);
    } else {
      createInspectionMutation.mutate(cleanData);
    }
    toast({
      title: "임시저장 완료",
      description: "작업 내용이 저장되었습니다.",
    });
  };

  const handlePreview = () => {
    const data = form.getValues();
    
    try {
      console.log('Starting PDF generation with data:', data);
      
      // Get inspector and site data with null checks
      const inspector = Array.isArray(inspectors) ? inspectors.find(i => i.id === data.inspectorId) : null;
      const site = Array.isArray(sites) ? sites.find(s => s.id === data.siteId) : null;
      
      console.log('Inspector:', inspector);
      console.log('Site:', site);
      
      // Simple data preparation for PDF
      const pdfData = {
        documentNumber: data.documentNumber || '미입력',
        visitCount: data.visitCount || '1차',
        inspectionDate: data.inspectionDate || new Date().toLocaleDateString('ko-KR'),
        inspector: inspector?.name || '미지정',
        result: data.result || '점검중',
        facilityManager: data.facilityManager || '미입력',
        summary: data.summary || '점검 진행중',
        contractorName: data.contractorName || '미입력',
        address: `${data.province || ''} ${data.district || ''} ${data.detailAddress || ''}`.trim() || '미입력',
        products: data.products || [],
        fuel: data.fuel || '미입력',
        exhaustType: data.exhaustType || '미입력',
        electrical: data.electrical || '미입력',
        piping: data.piping || '미입력',
        waterSupply: data.waterSupply || '미입력',
        control: data.control || '미입력',
        purpose: data.purpose || '미입력',
        deliveryType: data.deliveryType || '미입력',
        installationDate: data.installationDate || '미입력'
      };
      
      console.log('Formatted PDF data:', pdfData);
      
      // Generate PDF
      const pdfDataUri = generateInspectionPDF(pdfData);
      console.log('PDF generated successfully');
      
      // Check if device supports popup windows (mobile compatibility)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile devices, create a download link
        const link = document.createElement('a');
        link.href = pdfDataUri;
        link.download = `점검보고서_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF 다운로드",
          description: "PDF 파일이 다운로드되었습니다.",
        });
      } else {
        // For desktop, try to open in new window
        try {
          const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>점검 보고서 미리보기</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      margin: 0; 
                      padding: 20px; 
                      font-family: Arial, sans-serif; 
                      background-color: #f5f5f5;
                    }
                    .container {
                      max-width: 800px;
                      margin: 0 auto;
                      background: white;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                      text-align: center; 
                      margin-bottom: 20px; 
                      border-bottom: 2px solid #007bff;
                      padding-bottom: 15px;
                    }
                    .controls { 
                      text-align: center; 
                      margin-bottom: 20px; 
                    }
                    button { 
                      padding: 10px 20px; 
                      margin: 0 10px; 
                      background: #007bff; 
                      color: white; 
                      border: none; 
                      border-radius: 5px; 
                      cursor: pointer; 
                      font-size: 14px;
                    }
                    button:hover { 
                      background: #0056b3; 
                    }
                    .pdf-viewer { 
                      width: 100%; 
                      height: 600px; 
                      border: 1px solid #ddd; 
                      border-radius: 4px;
                      background: #fff;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    embed, iframe { 
                      width: 100%; 
                      height: 100%; 
                      border: none;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>점검 보고서 미리보기</h2>
                      <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div class="controls">
                      <button onclick="downloadPDF()">PDF 다운로드</button>
                      <button onclick="window.print()">인쇄하기</button>
                      <button onclick="window.close()">닫기</button>
                    </div>
                    <div class="pdf-viewer">
                      <embed src="${pdfDataUri}" type="application/pdf" width="100%" height="100%" />
                    </div>
                  </div>
                  <script>
                    function downloadPDF() {
                      const link = document.createElement('a');
                      link.href = '${pdfDataUri}';
                      link.download = '점검보고서_' + new Date().toISOString().slice(0,10) + '.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  </script>
                </body>
              </html>
            `);
            newWindow.document.close();
            
            toast({
              title: "PDF 미리보기 열림",
              description: "새 창에서 PDF를 확인하세요.",
            });
          } else {
            throw new Error('Popup blocked');
          }
        } catch (popupError) {
          // Fallback: download PDF directly
          const link = document.createElement('a');
          link.href = pdfDataUri;
          link.download = '점검보고서_미리보기.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "PDF 다운로드",
            description: "팝업 차단으로 인해 PDF를 다운로드했습니다.",
          });
        }
      }
    } catch (error) {
      console.error('PDF 미리보기 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast({
        title: "미리보기 오류",
        description: `PDF 생성 중 오류: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    setActionSheetOpen(true);
  };

  const handleCompleteInspection = async (action: 'pdf' | 'email' | 'save') => {
    const data = form.getValues();
    
    // Filter out incomplete products before saving
    const validProducts = (data.products || [])
      .filter((p): p is {name: string, count: number} => 
        p != null && 
        typeof p.name === 'string' && 
        p.name.length > 0 && 
        typeof p.count === 'number' && 
        p.count > 0
      );
    const cleanData = { ...data, products: validProducts };
    
    try {
      // Save inspection first
      if (editInspectionId) {
        await updateInspectionMutation.mutateAsync({ ...cleanData, status: "completed" });
      } else {
        const inspection = await createInspectionMutation.mutateAsync({ ...cleanData, status: "completed" });
        setCurrentInspectionId(inspection.id);
      }

      switch (action) {
        case 'pdf':
          // Use the same PDF generation logic as preview
          handlePreview();
          break;
        case 'email':
          toast({
            title: "이메일 발송 준비",
            description: "이메일 발송 화면으로 이동합니다.",
          });
          // Navigate to email sending page
          break;
        case 'save':
          toast({
            title: "점검 완료",
            description: "점검이 완료되어 저장되었습니다.",
          });
          setLocation("/");
          break;
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "점검 완료 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }

    setActionSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onMenuClick={() => setDrawerOpen(true)} title="새 점검" />
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />



      <main className="pb-20">
        <FormProvider {...form}>
          <form>
            <InspectionInfoSection 
              form={form} 
              inspectors={Array.isArray(inspectors) ? inspectors : []}
            />
            
            <InstallationInfoSection 
              form={form}
              sites={Array.isArray(sites) ? sites : []}
            />
            
            <ChecklistSection 
              form={form}
            />
            
            <PhotoUploadSection 
              inspectionId={tempInspectionId}
            />
          </form>
        </FormProvider>
      </main>

      <FloatingActionButtons
        onSaveDraft={handleSaveDraft}
        onPreview={handlePreview}
        onComplete={handleComplete}
      />

      <ActionSheetModal
        isOpen={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onAction={handleCompleteInspection}
      />

      {autoSaveStatus && (
        <ToastNotification
          message={autoSaveStatus}
          type="success"
        />
      )}
    </div>
  );
}
