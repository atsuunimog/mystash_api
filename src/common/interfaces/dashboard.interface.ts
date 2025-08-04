export interface DashboardAggregates {
  totalSavingsBalance: {
    USD: number;
    NGN: number;
  };
  totalWalletBalance: Record<string, number>;
  totalTransactionVolume: Record<string, number>;
  totalUsers: number;
  recentUsers: RecentUser[];
  signupChartData: YearlySignupChartData;
}

export interface RecentUser {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: {
    phoneNumber: string;
    isoCode: string;
  };
  verifications: {
    email: boolean;
    mobile: boolean;
  };
  createdAt: Date;
}

export interface MonthlySignupData {
  month: string;
  signups: number;
}

export interface YearlySignupChartData {
  [year: string]: MonthlySignupData[];
}

export interface SavingsAggregates {
  totalSavingsBalance: {
    USD: number;
    NGN: number;
  };
  regularSavings: {
    USD: number;
    NGN: number;
  };
  targetSavings: {
    USD: number;
    NGN: number;
  };
  salarySavings: {
    USD: number;
    NGN: number;
  };
  totalSavingsPlans: number;
  maturePlans: MaturePlan[];
}

export interface MaturePlan {
  publicId: string;
  name: string;
  saveType: string;
  currency: string;
  balance: number;
  target: number;
  endDate: Date;
  maturityStatus: string;
}
