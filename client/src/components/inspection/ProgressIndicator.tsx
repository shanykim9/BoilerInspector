import { Card, CardContent } from "@/components/ui/card";

interface ProgressIndicatorProps {
  progress: number;
  autoSaveStatus?: string;
}

export default function ProgressIndicator({ progress, autoSaveStatus }: ProgressIndicatorProps) {
  const sections = Math.floor(progress / 33.33);
  const totalSections = 3;

  return (
    <Card className="mx-4 mt-4 border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">진행률</span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{sections}/{totalSections} 섹션 완료</span>
          {autoSaveStatus && (
            <span className="text-red-600 text-xs font-medium">{autoSaveStatus}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
