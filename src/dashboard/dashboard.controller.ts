import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAggregates, MonthlySignupData, YearlySignupChartData, SavingsAggregates } from '../common/interfaces';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('aggregate')
  async getDashboardAggregates(): Promise<DashboardAggregates> {
    return this.dashboardService.getDashboardAggregates();
  }

  @Get('chart/signups')
  async getUserSignupChartData(@Query('year') year?: string): Promise<MonthlySignupData[]> {
    return this.dashboardService.getUserSignupChartData(year);
  }

  @Get('chart/signups/all-years')
  async getAllYearsSignupData(): Promise<YearlySignupChartData> {
    return this.dashboardService.getAllYearsSignupData();
  }

  @Get('savings/aggregate')
  async getSavingsAggregates(): Promise<SavingsAggregates> {
    return this.dashboardService.getSavingsAggregates();
  }
}
