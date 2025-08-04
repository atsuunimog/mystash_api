import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { PaginatedResponse, ApiResponse } from '../common/interfaces';
import { Stashes, StashesDocument } from '../finance/stashes/stashes.schema';
import { Wallets, WalletsDocument } from '../finance/wallets/wallets.schema';
import { Transactions, TransactionsDocument } from '../finance/transactions/transactions.schema';
import { Payments, PaymentsDocument } from '../finance/payments/payments.schema';
import { Transfers, TransfersDocument } from '../finance/transfers/transfer.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name, 'auth-db') private userModel: Model<UserDocument>,
    @InjectModel(Stashes.name, 'service-db') private stashesModel: Model<StashesDocument>,
    @InjectModel(Wallets.name, 'service-db') private walletsModel: Model<WalletsDocument>,
    @InjectModel(Transactions.name, 'service-db') private transactionsModel: Model<TransactionsDocument>,
    @InjectModel(Payments.name, 'service-db') private paymentsModel: Model<PaymentsDocument>,
    @InjectModel(Transfers.name, 'service-db') private transfersModel: Model<TransfersDocument>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<User>> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userModel
          .find({ deleted: { $ne: true } })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments({ deleted: { $ne: true } }).exec(),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      console.error('UserService: Database error:', error);
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  async findByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.userModel
        .findOne({
          email,
          deleted: { $ne: true },
        })
        .exec();

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      console.error('UserService: Database error:', error);
      throw new Error('Error fetching user by email: ' + error.message);
    }
  }


  async getStashesByAuthId(authId: string, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
    try {
      if (!Types.ObjectId.isValid(authId)) {
        return {
          success: false,
          message: 'Invalid auth ID format',
          data: null
        };
      }

      const skip = (page - 1) * limit;
      const [stashes, total] = await Promise.all([
        this.stashesModel.find({
          auth: new Types.ObjectId(authId),
          deleted: { $ne: true }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
        this.stashesModel.countDocuments({
          auth: new Types.ObjectId(authId),
          deleted: { $ne: true }
        })
      ]);

      const paginatedData: PaginatedResponse<Stashes> = {
        data: stashes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      return {
        success: true,
        message: 'User stashes retrieved successfully',
        data: paginatedData
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve user stashes',
        data: null
      };
    }
  }

  async getUserStashStats(authId: string): Promise<ApiResponse<any>> {
    try {
      if (!Types.ObjectId.isValid(authId)) {
        return {
          success: false,
          message: 'Invalid auth ID format',
          data: null
        };
      }

      const stats = await this.stashesModel.aggregate([
        { $match: { auth: new Types.ObjectId(authId), deleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalStashes: { $sum: 1 },
            totalBalance: { $sum: '$balance' },
            totalTarget: { $sum: '$target' },
            totalCurrentInterest: { $sum: '$currentInterest' },
            avgBalance: { $avg: '$balance' },
            stashesBySaveType: {
              $push: {
                saveType: '$saveType',
                balance: '$balance',
                target: '$target'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalStashes: 1,
            totalBalance: 1,
            totalTarget: 1,
            totalCurrentInterest: 1,
            avgBalance: { $round: ['$avgBalance', 2] }
          }
        }
      ]);

      const saveTypeStats = await this.stashesModel.aggregate([
        { $match: { auth: new Types.ObjectId(authId), deleted: { $ne: true } } },
        {
          $group: {
            _id: '$saveType',
            count: { $sum: 1 },
            totalBalance: { $sum: '$balance' },
            totalTarget: { $sum: '$target' }
          }
        }
      ]);

      return {
        success: true,
        message: 'User stash statistics retrieved successfully',
        data: {
          overview: stats[0] || {
            totalStashes: 0,
            totalBalance: 0,
            totalTarget: 0,
            totalCurrentInterest: 0,
            avgBalance: 0
          },
          saveTypeBreakdown: saveTypeStats
        }
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve user stash statistics',
        data: null
      };
    }
  }

  async getUserBalances(authId: string): Promise<ApiResponse<any>> {
    try {
      if (!Types.ObjectId.isValid(authId)) {
        return {
          success: false,
          message: 'Invalid auth ID format',
          data: null
        };
      }

      const [walletsBalance, stashesBalance] = await Promise.all([
        this.walletsModel.aggregate([
          { $match: { auth: new Types.ObjectId(authId), deleted: { $ne: true } } },
          {
            $group: {
              _id: '$currency',
              totalBalance: { $sum: '$balance' }
            }
          }
        ]),
        this.stashesModel.aggregate([
          { $match: { auth: new Types.ObjectId(authId), deleted: { $ne: true } } },
          {
            $group: {
              _id: '$currency',
              totalBalance: { $sum: '$balance' }
            }
          }
        ])
      ]);

      // Format balances by currency
      const formatBalances = (balances: any[]) => {
        const result = { NGN: 0, USD: 0 };
        balances.forEach(item => {
          if (item._id === 'NGN') result.NGN = item.totalBalance;
          if (item._id === 'USD') result.USD = item.totalBalance;
        });
        return result;
      };

      const walletBalances = formatBalances(walletsBalance);
      const stashBalances = formatBalances(stashesBalance);

      return {
        success: true,
        message: 'User balances retrieved successfully',
        data: {
          wallets: walletBalances,
          stashes: stashBalances,
          total: {
            NGN: walletBalances.NGN + stashBalances.NGN,
            USD: walletBalances.USD + stashBalances.USD
          }
        }
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve user balances',
        data: null
      };
    }
  }

  async getAggregateUserBalances(): Promise<ApiResponse<any>> {
    try {
      const [walletsAgg, stashesAgg] = await Promise.all([
        this.walletsModel.aggregate([
          { $match: { deleted: { $ne: true } } },
          {
            $group: {
              _id: '$currency',
              totalBalance: { $sum: '$balance' },
              userCount: { $addToSet: '$auth' }
            }
          },
          {
            $project: {
              _id: 1,
              totalBalance: 1,
              userCount: { $size: '$userCount' }
            }
          }
        ]),
        this.stashesModel.aggregate([
          { $match: { deleted: { $ne: true } } },
          {
            $group: {
              _id: '$currency',
              totalBalance: { $sum: '$balance' },
              userCount: { $addToSet: '$auth' }
            }
          },
          {
            $project: {
              _id: 1,
              totalBalance: 1,
              userCount: { $size: '$userCount' }
            }
          }
        ])
      ]);

      // Format aggregate data
      const formatAggregateData = (data: any[]) => {
        const result = { NGN: { totalBalance: 0, userCount: 0 }, USD: { totalBalance: 0, userCount: 0 } };
        data.forEach(item => {
          if (item._id === 'NGN') {
            result.NGN = { totalBalance: item.totalBalance, userCount: item.userCount };
          }
          if (item._id === 'USD') {
            result.USD = { totalBalance: item.totalBalance, userCount: item.userCount };
          }
        });
        return result;
      };

      const walletAggregates = formatAggregateData(walletsAgg);
      const stashAggregates = formatAggregateData(stashesAgg);

      return {
        success: true,
        message: 'Aggregate user balances retrieved successfully',
        data: {
          wallets: walletAggregates,
          stashes: stashAggregates,
          combined: {
            NGN: {
              totalBalance: walletAggregates.NGN.totalBalance + stashAggregates.NGN.totalBalance,
              uniqueUsers: Math.max(walletAggregates.NGN.userCount, stashAggregates.NGN.userCount)
            },
            USD: {
              totalBalance: walletAggregates.USD.totalBalance + stashAggregates.USD.totalBalance,
              uniqueUsers: Math.max(walletAggregates.USD.userCount, stashAggregates.USD.userCount)
            }
          }
        }
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve aggregate user balances',
        data: null
      };
    }
  }

  async getWalletsByAuthId(authId: string, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Wallets>>> {
    try {
      if (!Types.ObjectId.isValid(authId)) {
        return {
          success: false,
          message: 'Invalid auth ID format',
          data: null
        };
      }

      const skip = (page - 1) * limit;
      const [wallets, total] = await Promise.all([
        this.walletsModel.find({
          auth: new Types.ObjectId(authId),
          deleted: { $ne: true }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
        this.walletsModel.countDocuments({
          auth: new Types.ObjectId(authId),
          deleted: { $ne: true }
        })
      ]);

      const paginatedData: PaginatedResponse<Wallets> = {
        data: wallets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      return {
        success: true,
        message: 'User wallets retrieved successfully',
        data: paginatedData
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve user wallets',
        data: null
      };
    }
  }

  async getUserAggregateData(authId: string): Promise<ApiResponse<any>> {
    try {
      if (!Types.ObjectId.isValid(authId)) {
        return {
          success: false,
          message: 'Invalid auth ID format',
          data: null
        };
      }

      const authObjectId = new Types.ObjectId(authId);
      const limit = 5; // Set limit to 5 for longer datasets

      // Execute all queries in parallel for better performance
      const [
        user,
        stashes,
        wallets,
        transactions,
        payments,
        transfers,
        stashCount,
        walletCount,
        transactionCount,
        paymentCount,
        transferCount
      ] = await Promise.all([
        // Get user details
        this.userModel.findOne({ 
          auth: authObjectId, 
          deleted: { $ne: true } 
        }).exec(),
        
        // Get limited stashes with counts
        this.stashesModel.find({
          auth: authObjectId,
          deleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
        
        // Get limited wallets with counts
        this.walletsModel.find({
          auth: authObjectId,
          deleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
        
        // Get limited transactions
        this.transactionsModel.find({
          auth: authObjectId,
          deleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
        
        // Get limited payments
        this.paymentsModel.find({
          'metaData.uid': authId,
          deleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
        
        // Get limited transfers
        this.transfersModel.find({
          auth: authObjectId,
          deleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),

        // Get total counts
        this.stashesModel.countDocuments({
          auth: authObjectId,
          deleted: { $ne: true }
        }).exec(),
        
        this.walletsModel.countDocuments({
          auth: authObjectId,
          deleted: { $ne: true }
        }).exec(),
        
        this.transactionsModel.countDocuments({
          auth: authObjectId,
          deleted: { $ne: true }
        }).exec(),
        
        this.paymentsModel.countDocuments({
          'metaData.uid': authId,
          deleted: { $ne: true }
        }).exec(),
        
        this.transfersModel.countDocuments({
          auth: authObjectId,
          deleted: { $ne: true }
        }).exec()
      ]);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      // Calculate summary statistics
      const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
      const totalStashValue = stashes.reduce((sum, stash) => sum + (stash.target || 0), 0);

      const aggregateData = {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.mobile?.phoneNumber || '',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        summary: {
          totalBalance,
          totalStashValue,
          counts: {
            stashes: stashCount,
            wallets: walletCount,
            transactions: transactionCount,
            payments: paymentCount,
            transfers: transferCount
          }
        },
        recentData: {
          stashes: {
            data: stashes,
            showing: stashes.length,
            total: stashCount,
            hasMore: stashCount > limit
          },
          wallets: {
            data: wallets,
            showing: wallets.length,
            total: walletCount,
            hasMore: walletCount > limit
          },
          transactions: {
            data: transactions,
            showing: transactions.length,
            total: transactionCount,
            hasMore: transactionCount > limit
          },
          payments: {
            data: payments,
            showing: payments.length,
            total: paymentCount,
            hasMore: paymentCount > limit
          },
          transfers: {
            data: transfers,
            showing: transfers.length,
            total: transferCount,
            hasMore: transferCount > limit
          }
        }
      };

      return {
        success: true,
        message: 'User aggregate data retrieved successfully',
        data: aggregateData
      };

    } catch (error) {
      console.error('UserService: Error getting aggregate data:', error);
      return {
        success: false,
        message: 'Failed to retrieve user aggregate data: ' + error.message,
        data: null
      };
    }
  }


}
