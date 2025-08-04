import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OldUser, OldUserDocument } from './old_user.schema';
import {
  OldUserStatistics,
  OldUserStatisticsDocument,
} from './old_user-statistics.schema';
import {
  Transactions,
  TransactionsDocument,
} from '../finance/transactions/transactions.schema';
import {
  Payments,
  PaymentsDocument,
} from '../finance/payments/payments.schema';
import { PaginatedResponse, ApiResponse } from '../common/interfaces';

@Injectable()
export class OldUserService {
  constructor(
    @InjectModel(OldUser.name, 'dev-db')
    private userModel: Model<OldUserDocument>,
    @InjectModel(OldUserStatistics.name, 'dev-db')
    private userStatisticsModel: Model<OldUserStatisticsDocument>,
    @InjectModel(Transactions.name, 'dev-db')
    private transactionsModel: Model<TransactionsDocument>,
    @InjectModel(Payments.name, 'dev-db')
    private paymentsModel: Model<PaymentsDocument>,
  ) {}

  /**
   * Get all users with pagination.
   * @param page The page number to retrieve.
   * @param limit The number of users per page.
   * @returns A promise that resolves to a paginated response containing the users.
   */
  async getAllUsers(page = 1, limit = 20): Promise<PaginatedResponse<OldUser>> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.aggregate([
        {
          $match: {
            $and: [{ disabled: { $ne: true } }, { suspended: { $ne: true } }],
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            id: '$uid',
            name: 1,
            email: 1,
            phoneNumber: 1,
            onboardingStage: 1,
            ambassador: 1,
            personas: 1,
            suspended: 1,
            disabled: 1,
            emailVerified: 1,
            role: 1,
            referralCode: 1,
            joinedAt: '$createdAt',
          },
        },
        { $sort: { joinedAt: -1 } },
      ]),

      this.userModel.countDocuments({
        $and: [{ disabled: { $ne: true } }, { suspended: { $ne: true } }],
      }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a user by their uid.
   * @param uid The user's unique ID.
   * @returns The user document or null if not found.
   * This method ensures that the user is not disabled or suspended.
   */
  async getUserByUID(uid: string): Promise<ApiResponse<OldUser>> {
    try {
      const user = await this.userModel
        .findOne({
          uid,
          disabled: { $ne: true },
          suspended: { $ne: true },
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
      console.error('OldUserService: Database error:', error);
      throw new Error('Error fetching user by UID: ' + error.message);
    }
  }

  async getUserByEmail(email: string): Promise<ApiResponse<OldUser>> {
    try {
      const user = await this.userModel
        .findOne({
          email,
          disabled: { $ne: true },
          suspended: { $ne: true },
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
      console.error('OldUserService: Database error:', error);
      throw new Error('Error fetching user by email: ' + error.message);
    }
  }

  /**
   * Get user statistics by their uid.
   * @param uid The user's unique ID.
   * @returns A promise that resolves to an API response containing the user statistics or error message.
   */
  async getUserStatistics(
    uid: string,
  ): Promise<ApiResponse<OldUserStatistics>> {
    console.log(
      'OldUserService: Attempting to fetch user statistics with uid:',
      uid,
    );
    try {
      const statistics = await this.userStatisticsModel.findOne({ uid }).exec();

      if (!statistics) {
        return {
          success: false,
          message: 'User statistics not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: statistics,
      };
    } catch (error) {
      console.error('OldUserService: Database error:', error);
      throw new Error('Error fetching user statistics: ' + error.message);
    }
  }

  /**
   * Get user transactions by UID with pagination
   * @param uid The user's unique ID
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated transactions for the user
   */
  async getUserTransactions(
    uid: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    try {
      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
        this.transactionsModel.aggregate([
          { $match: { uid: uid } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              type: 1,
              amount: 1,
              narration: 1,
              date: 1,
              balance: 1,
              transactionId: 1,
              uid: 1,
              obpId: 1,
              obpName: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          { $sort: { date: -1 } },
        ]),
        this.transactionsModel.countDocuments({ uid: uid }),
      ]);

      const paginatedResponse = {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };

      return {
        success: true,
        data: paginatedResponse,
        message: 'User transactions retrieved successfully',
      };
    } catch (error) {
      console.error('OldUserService: Error fetching user transactions:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving user transactions: ${error.message}`,
      };
    }
  }

  /**
   * Get user payments ordered by most recent.
   * @param uid The user's unique ID.
   * @param page Page number for pagination.
   * @param limit Number of items per page.
   * @returns A promise that resolves to an API response containing paginated user payments.
   */
  async getUserPayments(
    uid: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Payments>>> {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        this.paymentsModel
          .find({ user: uid })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.paymentsModel.countDocuments({ user: uid }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: payments,
          pagination: {
            page,
            limit,
            total,
            pages: totalPages,
          },
        },
        message: 'User payments retrieved successfully',
      };
    } catch (error) {
      console.error('OldUserService: Error fetching user payments:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving user payments: ${error.message}`,
      };
    }
  }

  /**
   * Get user payment statistics.
   * @param uid The user's unique ID.
   * @returns A promise that resolves to an API response containing user payment statistics.
   */
  async getUserPaymentStats(uid: string): Promise<ApiResponse<any>> {
    try {
      const stats = await this.paymentsModel
        .aggregate([
          { $match: { user: uid } },
          {
            $group: {
              _id: null,
              totalPayments: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
              averageAmount: { $avg: '$amount' },
              successfulPayments: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
              },
              failedPayments: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
            },
          },
        ])
        .exec();

      return {
        success: true,
        data: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          averageAmount: 0,
          successfulPayments: 0,
          failedPayments: 0,
        },
        message: 'User payment statistics retrieved successfully',
      };
    } catch (error) {
      console.error(
        'OldUserService: Error fetching user payment stats:',
        error,
      );
      return {
        success: false,
        data: null,
        message: `Error retrieving user payment statistics: ${error.message}`,
      };
    }
  }
}
