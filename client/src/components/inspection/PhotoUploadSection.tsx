import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadSectionProps {
  inspectionId: string | null;
}

const photoCategories = [
  { id: "front", label: "설치 전면" },
  { id: "control", label: "제어판" },
  { id: "piping", label: "배관 상태" },
  { id: "other", label: "기타" },
];

export default function PhotoUploadSection({ inspectionId }: PhotoUploadSectionProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: string }) => {
      if (!inspectionId) {
        throw new Error("점검 ID가 필요합니다");
      }

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("category", category);

      const response = await fetch(`/api/inspections/${inspectionId}/photos`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("사진 업로드에 실패했습니다");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const { category } = variables;
      setUploadedPhotos(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), data.photoUrl]
      }));
      
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${inspectionId}`] });
      
      toast({
        title: "사진 업로드 완료",
        description: "사진이 성공적으로 업로드되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (category: string, file: File) => {
    console.log('File selected:', { name: file.name, size: file.size, type: file.type, category });
    
    if (!inspectionId) {
      toast({
        title: "시스템 오류",
        description: "점검 ID가 생성되지 않았습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "5MB 이하의 이미지만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting photo upload for inspection:', inspectionId);
    uploadPhotoMutation.mutate({ file, category });
  };

  const removePhoto = (category: string, photoUrl: string) => {
    setUploadedPhotos(prev => ({
      ...prev,
      [category]: prev[category]?.filter(url => url !== photoUrl) || []
    }));
  };

  return (
    <Card className="m-4 shadow-sm border">
      <CardHeader className="p-4 border-b bg-purple-50">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Camera className="w-5 h-5 text-purple-600 mr-2" />
          현장 사진
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {photoCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {category.label}
              </label>
              
              {/* Upload Area */}
              <div className="space-y-2">
                {/* Gallery Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(category.id, file);
                      }
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors bg-gray-50">
                    <FolderOpen className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">갤러리에서 선택</p>
                  </div>
                </div>

                {/* Camera Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(category.id, file);
                      }
                    }}
                  />
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors bg-blue-50">
                    <Camera className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-blue-600">사진 촬영</p>
                  </div>
                </div>

                {/* Progress Indicator */}
                {uploadPhotoMutation.isPending && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-primary h-1 rounded-full animate-pulse w-1/2"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Photos */}
              {uploadedPhotos[category.id] && uploadedPhotos[category.id].length > 0 && (
                <div className="space-y-2">
                  {uploadedPhotos[category.id].map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`${category.label} ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={() => removePhoto(category.id, photoUrl)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
