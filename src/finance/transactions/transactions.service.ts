import { Injectable } from '@nestjs/common';
import { Transactions, TransactionsDocument } from './transactions.schema';
import { User, UserDocument } from '../../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions.name, 'service-db')
    private transactionsModel: Model<TransactionsDocument>,
    @InjectModel(User.name, 'auth-db')
    private userModel: Model<UserDocument>,
  ) {}

  async getAllTransactions(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionsModel.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            publicId: 1,
            auth: 1,
            profile: 1,
            currency: 1,
            entry: 1,
            destination: 1,
            destinationType: 1,
            source: 1,
            sourceType: 1,
            amount: 1,
            balance: 1,
            fee: 1,
            narration: 1,
            reference: 1,
            tRef: 1,
            status: 1,
            completedAt: 1,
            processor: 1,
            currencyPair: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
      this.transactionsModel.countDocuments({ deleted: { $ne: true } }),
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
  async getTransactionById(id: string): Promise<ApiResponse<Transactions>> {
    try {
      const transaction = await this.transactionsModel.findById(id).exec();

      if (!transaction || transaction.deleted) {
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
   * @param authId The user's auth ID
   * @returns Transactions for today and yesterday grouped by date
   */
  async getUserRecentTransactions(authId: string): Promise<ApiResponse<any>> {
    try {
      const authObjectId = new Types.ObjectId(authId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const transactions = await this.transactionsModel.aggregate([
        {
          $match: {
            auth: authObjectId,
            deleted: { $ne: true },
            $or: [
              {
                createdAt: {
                  $gte: today,
                  $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
              },
              {
                createdAt: {
                  $gte: yesterday,
                  $lt: today,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            dayLabel: {
              $cond: {
                if: { $gte: ['$createdAt', today] },
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
                publicId: '$publicId',
                entry: '$entry',
                amount: '$amount',
                narration: '$narration',
                createdAt: '$createdAt',
                balance: '$balance',
                reference: '$reference',
                status: '$status',
                currency: '$currency',
                destinationType: '$destinationType',
                sourceType: '$sourceType',
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
   * Get user transactions by auth ID with pagination
   * @param authId The user's auth ID
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated transactions for the user
   */
  async getTransactionsByAuthId(
    authId: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    try {
      const authObjectId = new Types.ObjectId(authId);
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        this.transactionsModel.aggregate([
          { $match: { auth: authObjectId, deleted: { $ne: true } } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              publicId: 1,
              currency: 1,
              entry: 1,
              destination: 1,
              destinationType: 1,
              source: 1,
              sourceType: 1,
              amount: 1,
              balance: 1,
              fee: 1,
              narration: 1,
              reference: 1,
              tRef: 1,
              status: 1,
              completedAt: 1,
              processor: 1,
              currencyPair: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          { $sort: { createdAt: -1 } },
        ]),
        this.transactionsModel.countDocuments({
          auth: authObjectId,
          deleted: { $ne: true },
        }),
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
      console.error('Error in getTransactionsByAuthId:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving transactions by auth ID: ${error.message}`,
      };
    }
  }

  /**
   * Get transactions by date range with optional user filtering
   * @param startDate Start date for the range
   * @param endDate End date for the range
   * @param authId Optional auth ID to filter by specific user
   * @returns Transactions within the specified date range
   */
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    authId?: string,
  ): Promise<ApiResponse<Transactions[]>> {
    try {
      const matchQuery: any = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        deleted: { $ne: true },
      };

      if (authId) {
        matchQuery.auth = new Types.ObjectId(authId);
      }

      const transactions = await this.transactionsModel.aggregate([
        { $match: matchQuery },
        {
          $project: {
            _id: 1,
            publicId: 1,
            currency: 1,
            entry: 1,
            destination: 1,
            destinationType: 1,
            source: 1,
            sourceType: 1,
            amount: 1,
            balance: 1,
            fee: 1,
            narration: 1,
            reference: 1,
            tRef: 1,
            status: 1,
            completedAt: 1,
            processor: 1,
            currencyPair: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
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

  /**
   * Get transactions by reference
   * @param reference The transaction reference
   * @returns Transaction details
   */
  async getTransactionByReference(
    reference: string,
  ): Promise<ApiResponse<Transactions>> {
    try {
      const transaction = await this.transactionsModel
        .findOne({
          reference,
          deleted: { $ne: true },
        })
        .exec();

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
   * Get user transaction statistics
   * @param authId The user's auth ID
   * @returns Transaction statistics
   */
  async getUserTransactionStats(authId: string): Promise<ApiResponse<any>> {
    try {
      const authObjectId = new Types.ObjectId(authId);

      const stats = await this.transactionsModel.aggregate([
        {
          $match: {
            auth: authObjectId,
            deleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalCredits: {
              $sum: {
                $cond: [{ $eq: ['$entry', 'credit'] }, '$amount', 0],
              },
            },
            totalDebits: {
              $sum: {
                $cond: [{ $eq: ['$entry', 'debit'] }, '$amount', 0],
              },
            },
            successfulTransactions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
              },
            },
            pendingTransactions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
              },
            },
            failedTransactions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      };

      return {
        success: true,
        data: result,
        message: 'Transaction statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Error retrieving transaction statistics: ${error.message}`,
      };
    }
  }

  async getTransactionsByEmail(
    email: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    try {
      // First, find the user by email to get their auth ID
      const user = await this.userModel.findOne({ 
        email: email.toLowerCase(),
        deleted: { $ne: true }
      }).exec();

      if (!user) {
        return {
          success: false,
          message: 'User not found with this email',
          data: null
        };
      }

      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
        this.transactionsModel
          .find({
            auth: user.auth,
            deleted: { $ne: true }
          })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.transactionsModel.countDocuments({
          auth: user.auth,
          deleted: { $ne: true }
        }).exec()
      ]);

      const paginatedData: PaginatedResponse<Transactions> = {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      return {
        success: true,
        message: 'Transaction history retrieved successfully',
        data: paginatedData
      };
    } catch (error) {
      return {
        success: false,
        message: `Error retrieving transaction history: ${error.message}`,
        data: null
      };
    }
  }
}
