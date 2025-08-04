import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Accounts, AccountsDocument } from '../finance/accounts/accounts.schema';
import { Transactions, TransactionsDocument } from '../finance/transactions/transactions.schema';
import { Wallets, WalletsDocument } from '../finance/wallets/wallets.schema';
import { Stashes, StashesDocument } from '../finance/stashes/stashes.schema';
import { DashboardAggregates, MonthlySignupData, YearlySignupChartData, SavingsAggregates, MaturePlan } from '../common/interfaces';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name, 'auth-db') private userModel: Model<UserDocument>,
    @InjectModel(Accounts.name, 'service-db') private accountsModel: Model<AccountsDocument>,
    @InjectModel(Transactions.name, 'service-db') private transactionsModel: Model<TransactionsDocument>,
    @InjectModel(Wallets.name, 'service-db') private walletsModel: Model<WalletsDocument>,
    @InjectModel(Stashes.name, 'service-db') private stashesModel: Model<StashesDocument>,
  ) {}

  async getDashboardAggregates(): Promise<DashboardAggregates> {
    // Get total savings balance from stashes (actual savings products)
    const totalSavingsBalance = await this.getTotalSavingsBalance();
    
    // Get total wallet balance (user spending money)
    const totalWalletBalance = await this.getTotalWalletBalance();
    
    // Get total transaction volume (money flow through platform)
    const totalTransactionVolume = await this.getTotalTransactionVolume();
    
    // Get total number of users
    const totalUsers = await this.getTotalUsers();
    
    // Get last 5 recent created users
    const recentUsers = await this.getRecentUsers();

    // Get signup chart data for all years
    const signupChartData = await this.getAllYearsSignupData();

    return {
      totalSavingsBalance,
      totalWalletBalance,
      totalTransactionVolume,
      totalUsers,
      recentUsers,
      signupChartData,
    };
  }

  private async getTotalSavingsBalance() {
    const result = await this.stashesModel.aggregate([
      {
        $match: {
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$currency',
          totalBalance: { $sum: '$balance' },
        },
      },
    ]);

    // Format the result to have USD and NGN totals
    const formatted = {
      USD: 0,
      NGN: 0,
    };

    result.forEach((item) => {
      if (item._id === 'USD' || item._id === 'NGN') {
        formatted[item._id] = item.totalBalance;
      }
    });

    return formatted;
  }

  private async getTotalWalletBalance() {
    const result = await this.walletsModel.aggregate([
      {
        $match: {
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$currency',
          totalBalance: { $sum: '$balance' },
        },
      },
    ]);

    return result.reduce((acc, item) => {
      acc[item._id] = item.totalBalance;
      return acc;
    }, {});
  }

  private async getTotalTransactionVolume() {
    const result = await this.transactionsModel.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.reduce((acc, item) => {
      acc[item._id] = item.totalAmount;
      return acc;
    }, {});
  }

  private async getTotalUsers() {
    return await this.userModel.countDocuments({
      deleted: { $ne: true },
    });
  }

  private async getRecentUsers() {
    return await this.userModel
      .find({
        deleted: { $ne: true },
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('publicId email firstName lastName mobile verifications createdAt')
      .lean();
  }

  async getUserSignupChartData(year?: string): Promise<MonthlySignupData[]> {
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;
    
    // Generate month labels
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    try {
      // Aggregate actual user signups by month for the specified year
      const signupData = await this.userModel.aggregate([
        {
          $match: {
            deleted: { $ne: true },
            createdAt: {
              $gte: new Date(`${targetYear}-01-01`),
              $lt: new Date(`${targetYear + 1}-01-01`)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            signups: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Create a map for easier lookup
      const signupMap = signupData.reduce((acc, item) => {
        acc[item._id] = item.signups;
        return acc;
      }, {});

      // Generate chart data with actual data or 0 for months with no signups
      const chartData = months.map((month, index) => ({
        month,
        signups: signupMap[index + 1] || 0
      }));

      return chartData;
    } catch (error) {
      // Return empty data if there's an error
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return months.map(month => ({ month, signups: 0 }));
    }
  }

  async getAllYearsSignupData(): Promise<YearlySignupChartData> {
    const currentYear = new Date().getFullYear();
    const years = ['2021', '2022', '2023', '2024', currentYear.toString()];
    
    const allData = {};
    
    for (const year of years) {
      allData[year] = await this.getUserSignupChartData(year);
    }
    
    return allData;
  }

  async getSavingsAggregates(): Promise<SavingsAggregates> {
    // Get total savings balance
    const totalSavingsBalance = await this.getTotalSavingsBalance();
    
    // Get regular savings totals
    const regularSavings = await this.getSavingsByType('regular');
    
    // Get target savings totals (assuming this was meant instead of "salary")
    const targetSavings = await this.getSavingsByType('target');
    
    // Get salary savings totals
    const salarySavings = await this.getSavingsByType('salary');
    
    // Get total count of savings plans
    const totalSavingsPlans = await this.getTotalSavingsPlans();
    
    // Get mature plans (limit 5)
    const maturePlans = await this.getMaturePlans();

    return {
      totalSavingsBalance,
      regularSavings,
      targetSavings,
      salarySavings,
      totalSavingsPlans,
      maturePlans,
    };
  }

  private async getSavingsByType(saveType: string) {
    const result = await this.stashesModel.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          saveType: saveType,
        },
      },
      {
        $group: {
          _id: '$currency',
          totalBalance: { $sum: '$balance' },
        },
      },
    ]);

    // Format the result to have USD and NGN totals
    const formatted = {
      USD: 0,
      NGN: 0,
    };

    result.forEach((item) => {
      if (item._id === 'USD' || item._id === 'NGN') {
        formatted[item._id] = item.totalBalance;
      }
    });

    return formatted;
  }

  private async getTotalSavingsPlans(): Promise<number> {
    return await this.stashesModel.countDocuments({
      deleted: { $ne: true },
    });
  }

  private async getMaturePlans(): Promise<MaturePlan[]> {
    const currentDate = new Date();
    
    const maturePlans = await this.stashesModel
      .find({
        deleted: { $ne: true },
        'duration.endDate': { $lte: currentDate },
      })
      .select('publicId name saveType currency balance target duration.endDate')
      .limit(5)
      .sort({ 'duration.endDate': -1 })
      .lean();

    return maturePlans.map((plan) => ({
      publicId: plan.publicId,
      name: plan.name,
      saveType: plan.saveType,
      currency: plan.currency,
      balance: plan.balance,
      target: plan.target,
      endDate: plan.duration.endDate,
      maturityStatus: 'matured',
    }));
  }
}
