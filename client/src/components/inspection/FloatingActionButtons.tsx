import { Button } from "@/components/ui/button";
import { Save, Eye, CheckCircle } from "lucide-react";

interface FloatingActionButtonsProps {
  onSaveDraft: () => void;
  onPreview: () => void;
  onComplete: () => void;
}

export default function FloatingActionButtons({ 
  onSaveDraft, 
  onPreview, 
  onComplete 
}: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-3 z-40">
      {/* Save Draft Button */}
      <Button
        onClick={onSaveDraft}
        className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        size="icon"
        title="임시저장"
      >
        <Save className="w-5 h-5" />
      </Button>
      
      {/* Preview Button */}
      <Button
        onClick={onPreview}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors flex items-center space-x-2"
        title="PDF 미리보기"
      >
        <Eye className="w-5 h-5" />
        <span className="text-sm font-medium whitespace-nowrap">PDF 미리보기</span>
      </Button>
      
      {/* Complete Button */}
      <Button
        onClick={onComplete}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transition-colors flex items-center space-x-2"
        title="점검 완료"
      >
        <CheckCircle className="w-6 h-6" />
        <span className="text-sm font-medium whitespace-nowrap">점검 완료</span>
      </Button>
    </div>
  );
}
