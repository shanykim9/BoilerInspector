export function calculateProgress(formData: any): number {
  const totalFields = 22; // Total number of form fields
  let filledFields = 0;

  // Inspection Info Section (7 fields)
  if (formData.documentNumber?.trim()) filledFields++;
  if (formData.visitCount) filledFields++;
  if (formData.inspectionDate) filledFields++;
  if (formData.inspectorId) filledFields++;
  if (formData.result) filledFields++;
  if (formData.facilityManager?.trim()) filledFields++;
  if (formData.summary?.trim()) filledFields++;

  // Installation Info Section (15 fields)
  if (formData.siteId) filledFields++;
  if (formData.unitCount) filledFields++;
  if (formData.product) filledFields++;
  if (formData.fuel?.trim()) filledFields++;
  if (formData.electrical?.trim()) filledFields++;
  if (formData.piping?.trim()) filledFields++;
  if (formData.control?.trim()) filledFields++;
  if (formData.integrationSystem?.trim()) filledFields++;
  if (formData.purpose) filledFields++;
  if (formData.location?.trim()) filledFields++;
  if (formData.installationDate?.trim()) filledFields++;
  if (formData.system?.trim()) filledFields++;
  if (formData.siteCondition?.trim()) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
}

export function validateInspectionForm(formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!formData.inspectionDate) {
    errors.push('점검일을 선택해주세요.');
  }

  if (!formData.inspectorId) {
    errors.push('점검자를 선택해주세요.');
  }

  if (!formData.siteId && !formData.contractorName) {
    errors.push('현장을 선택하거나 계약처명을 입력해주세요.');
  }

  if (!formData.result) {
    errors.push('점검결과를 선택해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatInspectionData(formData: any, siteData?: any, inspectorData?: any) {
  return {
    ...formData,
    contractorName: siteData?.contractorName || formData.contractorName,
    businessType: siteData?.businessType || formData.businessType,
    address: siteData?.address || formData.address,
    inspector: inspectorData ? `${inspectorData.name} (${inspectorData.code})` : undefined,
  };
}

export function getInspectionStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'draft':
      return 'text-yellow-600 bg-yellow-100';
    case 'sent':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getInspectionStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return '완료';
    case 'draft':
      return '진행중';
    case 'sent':
      return '발송됨';
    default:
      return '대기';
  }
}

export function generateDocumentNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INS${year}${month}${day}-${random}`;
}

export function isFormDataEqual(data1: any, data2: any): boolean {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (data1[key] !== data2[key]) {
      return false;
    }
  }
  
  return true;
}
