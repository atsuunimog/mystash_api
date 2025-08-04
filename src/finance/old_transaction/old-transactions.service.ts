import { Injectable } from '@nestjs/common';
import {
  OldTransactions,
  OldTransactionsDocument,
} from './old-transactions.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces';
import { OldUser, OldUserDocument } from '../../old_user/old_user.schema';

@Injectable()
export class OldTransactionsService {
  constructor(
    @InjectModel(OldTransactions.name, 'dev-db')
    private oldTransactionsModel: Model<OldTransactionsDocument>,
    @InjectModel(OldUser.name, 'dev-db')
    private userModel: Model<OldUserDocument>,
  ) {}

  async getAllTransactions(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.oldTransactionsModel.aggregate([
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
        { $sort: { createdAt: -1 } },
      ]),

      this.oldTransactionsModel.countDocuments(),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Get transaction by MongoDB _id
   * @param id The MongoDB _id of the transaction
   * @returns Transaction details
   */
  async getTransactionById(id: string): Promise<ApiResponse<OldTransactions>> {
    try {
      const transaction = await this.oldTransactionsModel.findById(id).exec();

      if (!transaction) {
        return {
          success: false,
          data: null,
          message: 'Transaction not found',
        };
      }

      return {
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Error retrieving transaction: ${error.message}`,
      };
    }
  }

  /**
   * Get user transaction history for today and yesterday
   * @param uid The user's unique ID
   * @returns Transactions for today and yesterday grouped by date
   */
  async getUserRecentTransactions(uid: string): Promise<ApiResponse<any>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const transactions = await this.oldTransactionsModel.aggregate([
        {
          $match: {
            uid: uid,
            $or: [
              {
                date: {
                  $gte: today,
                  $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // End of today
                },
              },
              {
                date: {
                  $gte: yesterday,
                  $lt: today, // Start of today
                },
              },
            ],
          },
        },
        {
          $addFields: {
            dayLabel: {
              $cond: {
                if: { $gte: ['$date', today] },
                then: 'today',
                else: 'yesterday',
              },
            },
          },
        },
        {
          $group: {
            _id: '$dayLabel',
            transactions: {
              $push: {
                _id: '$_id',
                type: '$type',
                amount: '$amount',
                narration: '$narration',
                date: '$date',
                balance: '$balance',
                transactionId: '$transactionId',
                obpId: '$obpId',
                obpName: '$obpName',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
              },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);

      const result = {
        today: transactions.find((group) => group._id === 'today') || {
          _id: 'today',
          transactions: [],
          count: 0,
          totalAmount: 0,
        },
        yesterday: transactions.find((group) => group._id === 'yesterday') || {
          _id: 'yesterday',
          transactions: [],
          count: 0,
          totalAmount: 0,
        },
      };

      return {
        success: true,
        data: result,
        message: 'Recent transactions retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Error retrieving recent transactions: ${error.message}`,
      };
    }
  }

  /**
   * Get user transactions by email with pagination
   * @param email The user's email address
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated transactions for the user
   */
  async getTransactionsByEmail(
    email: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<OldTransactions>>> {
    try {
      // First, find the user by email to get their UID
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        return {
          success: false,
          data: null,
          message: 'User not found with the provided email',
        };
      }

      const uid = user.uid;

      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
        this.oldTransactionsModel.aggregate([
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
        this.oldTransactionsModel.countDocuments({ uid: uid }),
      ]);

      const paginatedResponse = {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        userInfo: {
          email: user.email,
          uid: user.uid,
          name: user.name,
        },
      };

      return {
        success: true,
        data: paginatedResponse,
        message: 'User transactions retrieved successfully',
      };
    } catch (error) {
      console.error('Error in getTransactionsByEmail:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving transactions by email: ${error.message}`,
      };
    }
  }

  /**
   * Get transactions by date range with optional user filtering
   * @param startDate Start date for the range
   * @param endDate End date for the range
   * @param uid Optional user ID to filter by specific user
   * @returns Transactions within the specified date range
   */
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    uid?: string,
  ): Promise<ApiResponse<OldTransactions[]>> {
    try {
      // Build the match query
      const matchQuery: any = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      // Add uid filter if provided
      if (uid) {
        matchQuery.uid = uid;
      }

      const transactions = await this.oldTransactionsModel.aggregate([
        { $match: matchQuery },
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
      ]);

      return {
        success: true,
        data: transactions,
        message:
          'Transactions retrieved successfully for the specified date range',
      };
    } catch (error) {
      console.error('Error in getTransactionsByDateRange:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving transactions by date range: ${error.message}`,
      };
    }
  }
}
