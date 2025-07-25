import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface Product {
  name: string;
  count: number;
}

interface ProductListSectionProps {
  form: UseFormReturn<any>;
}

const PRODUCT_OPTIONS = [
  "NPW",
  "NCN-45HD",
  "NCB790",
  "NFB"
];

export default function ProductListSection({ form }: ProductListSectionProps) {
  const products = form.watch("products") || [];
  
  const addProduct = () => {
    const currentProducts = form.getValues("products") || [];
    form.setValue("products", [...currentProducts, { name: "", count: 1 }]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getValues("products") || [];
    const newProducts = currentProducts.filter((_: any, i: number) => i !== index);
    form.setValue("products", newProducts);
  };

  const updateProduct = (index: number, field: "name" | "count", value: string | number) => {
    const currentProducts = form.getValues("products") || [];
    const newProducts = [...currentProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };
    form.setValue("products", newProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">설치 제품 및 대수</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduct}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          제품 추가
        </Button>
      </div>

      {products.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <p>설치된 제품이 없습니다.</p>
              <p className="text-sm">제품 추가 버튼을 눌러 제품을 추가하세요.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {products.map((product: Product, index: number) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor={`product-name-${index}`}>제품명</Label>
                <Select
                  value={product.name}
                  onValueChange={(value) => updateProduct(index, "name", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="제품을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_OPTIONS.map((productName) => (
                      <SelectItem key={productName} value={productName}>
                        {productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`product-count-${index}`}>설치대수</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`product-count-${index}`}
                    type="number"
                    min="1"
                    value={product.count}
                    onChange={(e) => updateProduct(index, "count", parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <span className="text-sm text-muted-foreground">대</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length > 0 && (
        <div className="text-sm text-muted-foreground">
          총 {products.reduce((total: number, product: Product) => total + (product.count || 0), 0)}대 설치
        </div>
      )}
    </div>
  );
}