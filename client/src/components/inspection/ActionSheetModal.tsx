import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { FileText, Mail, Save, X } from "lucide-react";

interface ActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'pdf' | 'email' | 'save') => void;
}

export default function ActionSheetModal({ isOpen, onClose, onAction }: ActionSheetModalProps) {
  const handleAction = (action: 'pdf' | 'email' | 'save') => {
    onAction(action);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-0 z-50 w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>
        
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-center">점검 완료 처리</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">점검이 완료되었습니다. 보고서를 어떻게 처리하시겠습니까?</p>
        </CardHeader>
        
        <CardContent className="px-4 pb-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleAction('pdf')}
              variant="outline"
              className="w-full p-4 h-auto flex items-center justify-start space-x-3 hover:bg-gray-50"
            >
              <FileText className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium">PDF 다운로드</div>
                <div className="text-xs text-gray-500">완료된 점검 보고서를 PDF로 저장</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleAction('email')}
              variant="outline"
              className="w-full p-4 h-auto flex items-center justify-start space-x-3 hover:bg-gray-50"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">PDF 이메일 발송</div>
                <div className="text-xs text-gray-500">완료된 보고서를 이메일로 전송</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleAction('save')}
              variant="outline"
              className="w-full p-4 h-auto flex items-center justify-start space-x-3 hover:bg-gray-50"
            >
              <Save className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">완료 처리만</div>
                <div className="text-xs text-gray-500">나중에 PDF/이메일 처리</div>
              </div>
            </Button>
          </div>
          
          <Button 
            onClick={onClose}
            variant="secondary"
            className="w-full mt-4 p-3 bg-gray-200 hover:bg-gray-300"
          >
            취소
          </Button>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
