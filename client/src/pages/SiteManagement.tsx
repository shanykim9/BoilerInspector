import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AppHeader from "@/components/layout/AppHeader";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { Building, Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const siteSchema = z.object({
  contractorName: z.string().min(1, "계약처명을 입력해주세요"),
  businessType: z.string().optional(),
  address: z.string().min(1, "주소를 입력해주세요"),
});

type SiteForm = z.infer<typeof siteSchema>;

export default function SiteManagement() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SiteForm>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      contractorName: "",
      businessType: "",
      address: "",
    },
  });

  const { data: sites, isLoading } = useQuery({
    queryKey: searchQuery ? ["/api/sites", { search: searchQuery }] : ["/api/sites"],
  });

  const createSiteMutation = useMutation({
    mutationFn: async (data: SiteForm) => {
      const response = await apiRequest("POST", "/api/sites", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "현장 등록 완료",
        description: "새로운 현장이 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "현장 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: async (data: SiteForm) => {
      const response = await apiRequest("PUT", `/api/sites/${editingSite.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setDialogOpen(false);
      setEditingSite(null);
      form.reset();
      toast({
        title: "현장 수정 완료",
        description: "현장 정보가 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "수정 실패",
        description: "현장 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "현장 삭제 완료",
        description: "현장이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "현장 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SiteForm) => {
    if (editingSite) {
      updateSiteMutation.mutate(data);
    } else {
      createSiteMutation.mutate(data);
    }
  };

  const handleEdit = (site: any) => {
    setEditingSite(site);
    form.reset({
      contractorName: site.contractorName,
      businessType: site.businessType || "",
      address: site.address,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 현장을 삭제하시겠습니까?")) {
      deleteSiteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingSite(null);
    form.reset();
    setDialogOpen(true);
  };

  const businessTypes = [
    "아파트",
    "오피스텔", 
    "상업시설",
    "공장",
    "학교",
    "병원",
    "기타"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onMenuClick={() => setDrawerOpen(true)} title="현장 관리" />
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <main className="p-4 pb-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">현장 관리</h2>
            <p className="text-gray-600">등록된 현장들을 관리합니다</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                현장 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSite ? "현장 수정" : "새 현장 추가"}
                </DialogTitle>
                <DialogDescription>
                  {editingSite ? "현장 정보를 수정합니다" : "새로운 현장을 등록합니다"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contractorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약처명 *</FormLabel>
                        <FormControl>
                          <Input placeholder="계약처명을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업종</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="업종을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주소 *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="주소를 입력하세요"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createSiteMutation.isPending || updateSiteMutation.isPending}
                      className="flex-1"
                    >
                      {editingSite ? "수정" : "등록"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="계약처명 또는 주소로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sites List */}
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
        ) : sites && sites.length > 0 ? (
          <div className="space-y-4">
            {sites.map((site: any) => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">{site.contractorName}</h3>
                        {site.businessType && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {site.businessType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{site.address}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        등록일: {new Date(site.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(site)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(site.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 현장이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                새로운 현장을 등록하여 점검 관리를 시작하세요.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 현장 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
