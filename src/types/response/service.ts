export type ServiceCategoryResponse = {
  id: string;
  name: string;
  icon: string | null;
};

export type ServiceResponse = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  unit: string;
  status: string;
  displayAs?: string;
  category: ServiceCategoryResponse;
};

export type ServiceStatsResponse = {
  total: number;
  active: number;
  inactive: number;
  revenue: number;
};

export type ServicesFilter = {
  search?: string;
  categoryId?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
};

export type FindAllServicesResponse = {
  data: ServiceResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
};
