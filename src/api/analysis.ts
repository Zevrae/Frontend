import api from './api';

export interface AnalysisProduct {
  _id: string;
  name: string;
  category: string;
  subcategory: string;
  status?: string;
  stock_quantity: number;
  images: string[];
}

export interface AnalysisItem {
  demandCounter: number;
  notifyCounter: number;
  combinedScore?: number;
  // Per-size breakdown of "notify me" signups, e.g. { M: 3, L: 7 }, plus the
  // single most-demanded size derived from it. Empty/undefined for products
  // that don't use sizing (jewellery, accessories, etc.).
  sizeDemand?: Record<string, number>;
  topDemandedSize?: string | null;
  topDemandedSizeCount?: number;
  created_at?: string;
  updated_at?: string;
  product: AnalysisProduct | null;
}

export interface CategoryDemand {
  _id: string; // category name
  totalDemand: number;
  totalNotify: number;
  productCount: number;
  combinedScore: number;
}

export interface AnalysisSummary {
  byCategory: CategoryDemand[];
  topOverall: AnalysisItem[];
  unfulfilledDemand: AnalysisItem[];
}

export const analysisApi = {
  list: async (params?: { page?: number; limit?: number; sortBy?: 'demand' | 'notify' | 'combined' }) => {
    const response = await api.get('/analysis', { params });
    return response.data as {
      success: boolean;
      data: AnalysisItem[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  summary: async (): Promise<AnalysisSummary> => {
    const response = await api.get('/analysis/summary');
    return response.data.data;
  },
};
