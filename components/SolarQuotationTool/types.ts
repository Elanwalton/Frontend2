export interface Appliance {
  name: string;
  quantity: number;
  estimatedWatts: number;
  hoursPerDay: number;
  dailyKWh: number;
}

export interface AnalysisSummary {
  peakLoadWatts: number;
  dailyKWh: number;
  recommendedInverterKW: number;
  recommendedBatteryKWh: number;
  recommendedSolarKW: number;
  backupDays: number;
  sunHoursPerDay: number;
}

export interface AnalysisResult {
  appliances: Appliance[];
  summary: AnalysisSummary;
  assumptions: string;
  analysisId: string;
  timestamp?: string;
}

export interface SolarQuoteItem {
  product_id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface SolarQuoteResult {
  quote_id: number;
  quote_number: string;
  customer_name?: string;
  customer_email?: string;
  items: SolarQuoteItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  file_path: string;
  created_at?: string;
  expiry_date?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'rejected';
}
