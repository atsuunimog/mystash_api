import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payments, PaymentsDocument } from './payments.schema';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payments.name, 'dev-db')
    private paymentsModel: Model<PaymentsDocument>,
  ) {}

  async getAllPayments(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.paymentsModel.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            reference: 1,
            amount: 1,
            currency: 1,
            status: 1,
            type: 1,
            category: 1,
            description: 1,
            user: 1,
            gateway: 1,
            metadata: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
      this.paymentsModel.countDocuments(),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Payments | null> {
    return this.paymentsModel.findById(id).exec();
  }

  async findByReference(reference: string): Promise<Payments | null> {
    return this.paymentsModel.findOne({ reference }).exec();
  }

  async findByStatus(status: string): Promise<Payments[]> {
    return this.paymentsModel.find({ status }).exec();
  }

  async findByType(type: string): Promise<Payments[]> {
    return this.paymentsModel.find({ type }).exec();
  }

  async findByCategory(category: string): Promise<Payments[]> {
    return this.paymentsModel.find({ category }).exec();
  }

  async getPaymentStats(uid?: string) {
    const matchStage = uid ? { $match: { user: uid } } : { $match: {} };

    return this.paymentsModel
      .aggregate([
        matchStage,
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
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
    uid?: string,
  ): Promise<Payments[]> {
    const query: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (uid) {
      query.user = uid;
    }

    return this.paymentsModel.find(query).exec();
  }
}
