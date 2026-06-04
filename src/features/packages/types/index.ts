export interface PackageItem {
  id?: number;
  title: string;
  group: string;
  quantity: string;
  rate: string;
  amount: string;
  remark: string;
}

export interface Package {
  id?: number;
  businessId?: number;
  title: string;
  description?: string;
  totalAmount: string;
  currency: string;
  items: PackageItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageListResponse {
  packages: Package[];
}
