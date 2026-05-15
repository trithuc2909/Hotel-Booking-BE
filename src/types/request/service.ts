export type CreateServiceRequest = {
  name: string;
  serviceCategoryId: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  unit: string;
};

export type UpdateServiceRequest = {
  name?: string;
  serviceCategoryId?: string;
  description?: string;
  imageUrl?: string;
  basePrice?: number;
  unit?: string;
};
