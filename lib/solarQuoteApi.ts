import { apiPost } from '@/utils/apiClient';
import type { AnalysisResult, SolarQuoteResult } from '@/components/SolarQuotationTool/types';

export async function analyzeAppliancesAi(payload: {
  appliances: string;
  backupDays: number;
}): Promise<AnalysisResult> {
  const res = await apiPost<{ success: boolean; data: AnalysisResult }>(
    '/solar/analyzeAi',
    payload
  );
  return res.data;
}

export async function generateSolarQuote(payload: {
  analysisData: AnalysisResult;
  customerName: string;
  customerEmail: string;
}): Promise<SolarQuoteResult> {
  const res = await apiPost<{ success: boolean; data: SolarQuoteResult }>(
    '/solar/generateSolarQuote',
    payload
  );
  return res.data;
}
