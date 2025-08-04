import { Injectable } from '@nestjs/common';
import { Accounts, AccountsDocument } from './accounts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse } from '../../common/interfaces';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Accounts.name, 'service-db')
    private accountsModel: Model<AccountsDocument>,
  ) {}

  /**
   * Get all accounts with pagination.
   * @param page The page number to retrieve.
   * @param limit The number of items per page.
   * @returns A paginated response containing the accounts.
   */

  async getAllAccounts(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      this.accountsModel.aggregate([
        { $match: { deleted: false } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            id: '$publicId',
            reference: 1,
            type: 1,
            currency: 1,
            processor: 1,
            beneficiaryType: 1,
            active: 1,
            accountNumber: 1,
            accountName: 1,
            bankName: 1,
            bankCode: 1,
            data: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
      this.accountsModel.countDocuments({ deleted: false }),
    ]);

    return {
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
