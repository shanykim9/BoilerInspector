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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { Users, Plus, Edit, Trash2, Phone, Mail, UserCheck, UserX } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const inspectorSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  code: z.string().min(1, "점검자 코드를 입력해주세요"),
  phone: z.string().optional(),
  email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type InspectorForm = z.infer<typeof inspectorSchema>;

export default function InspectorManagement() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInspector, setEditingInspector] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InspectorForm>({
    resolver: zodResolver(inspectorSchema),
    defaultValues: {
      name: "",
      code: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  const { data: inspectors, isLoading } = useQuery({
    queryKey: ["/api/inspectors"],
  });

  const createInspectorMutation = useMutation({
    mutationFn: async (data: InspectorForm) => {
      const response = await apiRequest("POST", "/api/inspectors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspectors"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "점검자 등록 완료",
        description: "새로운 점검자가 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "점검자 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateInspectorMutation = useMutation({
    mutationFn: async (data: InspectorForm) => {
      const response = await apiRequest("PUT", `/api/inspectors/${editingInspector.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspectors"] });
      setDialogOpen(false);
      setEditingInspector(null);
      form.reset();
      toast({
        title: "점검자 수정 완료",
        description: "점검자 정보가 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "수정 실패",
        description: "점검자 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteInspectorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inspectors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspectors"] });
      toast({
        title: "점검자 삭제 완료",
        description: "점검자가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "점검자 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InspectorForm) => {
    if (editingInspector) {
      updateInspectorMutation.mutate(data);
    } else {
      createInspectorMutation.mutate(data);
    }
  };

  const handleEdit = (inspector: any) => {
    setEditingInspector(inspector);
    form.reset({
      name: inspector.name,
      code: inspector.code,
      phone: inspector.phone || "",
      email: inspector.email || "",
      isActive: inspector.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 점검자를 삭제하시겠습니까?")) {
      deleteInspectorMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingInspector(null);
    form.reset();
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onMenuClick={() => setDrawerOpen(true)} title="점검자 관리" />
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <main className="p-4 pb-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">점검자 관리</h2>
            <p className="text-gray-600">점검 작업을 수행하는 점검자들을 관리합니다</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                점검자 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingInspector ? "점검자 수정" : "새 점검자 추가"}
                </DialogTitle>
                <DialogDescription>
                  {editingInspector ? "점검자 정보를 수정합니다" : "새로운 점검자를 등록합니다"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이름 *</FormLabel>
                          <FormControl>
                            <Input placeholder="점검자 이름" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>점검자 코드 *</FormLabel>
                          <FormControl>
                            <Input placeholder="T001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호</FormLabel>
                        <FormControl>
                          <Input placeholder="010-1234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input placeholder="inspector@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">활성 상태</FormLabel>
                          <div className="text-sm text-gray-600">
                            비활성화하면 점검자 목록에서 선택할 수 없습니다
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createInspectorMutation.isPending || updateInspectorMutation.isPending}
                      className="flex-1"
                    >
                      {editingInspector ? "수정" : "등록"}
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

        {/* Inspectors List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : inspectors && inspectors.length > 0 ? (
          <div className="space-y-4">
            {inspectors.map((inspector: any) => (
              <Card key={inspector.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {inspector.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{inspector.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">코드: {inspector.code}</span>
                            {inspector.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <UserCheck className="w-3 h-3 mr-1" />
                                활성
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <UserX className="w-3 h-3 mr-1" />
                                비활성
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 ml-13">
                        {inspector.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{inspector.phone}</span>
                          </div>
                        )}
                        {inspector.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{inspector.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        등록일: {new Date(inspector.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(inspector)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(inspector.id)}
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
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 점검자가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                점검 작업을 수행할 점검자를 등록해주세요.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 점검자 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
