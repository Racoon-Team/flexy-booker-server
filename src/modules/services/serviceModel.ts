export interface CreateServiceDTO {
  businessId: number;
  name: string;
  description?: string;
  price?: number;
  schedule?: string[];
  customFields?: object[];
}
