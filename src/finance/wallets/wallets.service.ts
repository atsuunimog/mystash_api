import { Injectable } from '@nestjs/common';
import { Wallets, WalletsDocument } from './wallets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse } from '../../common/interfaces';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallets.name, 'service-db')
    private walletsModel: Model<WalletsDocument>,
  ) {}

  /**
   * Get all wallets with pagination.
   * @param page The page number to retrieve.
   * @param limit The number of items per page.
   * @returns A paginated response containing the wallets.
   */
  async getAllWallets(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [wallets, total] = await Promise.all([
      this.walletsModel.aggregate([
        { $match: { deleted: false } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            id: '$publicId',
            auth: 1,
            profile: 1,
            currency: 1,
            balance: 1,
            lastUpdated: 1,
            processor: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),

      this.walletsModel.countDocuments({ deleted: false }),
    ]);

    return {
      data: wallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a wallet by its public ID.
   * @param id The public ID of the wallet to find.
   * @returns The found wallet or null if not found.
   */
  async findOne(id: string): Promise<Wallets | null> {
    return await this.walletsModel
      .findOne({
        _id: id,
        deleted: false,
      })
      .select({
        _id: 1,
        id: '$publicId',
        auth: 1,
        profile: 1,
        currency: 1,
        balance: 1,
        lastUpdated: 1,
        processor: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .exec();
  }

  /**
   * Find a wallet by its auth ID.
   * @param authId The auth ID of the wallet to find.
   * @returns The found wallet or null if not found.
   */
  async findByAuthId(authId: string): Promise<Wallets | null> {
    return await this.walletsModel
      .findOne({
        auth: authId,
        deleted: false,
      })
      .select({
        _id: 1,
        id: '$publicId',
        auth: 1,
        profile: 1,
        currency: 1,
        balance: 1,
        lastUpdated: 1,
        processor: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .exec();
  }

  // async remove(id: string): Promise<{ success: boolean; message: string }> {
  //   const result = await this.walletsModel.updateOne(
  //     { publicId: id, deleted: false },
  //     { $set: { deleted: true, updatedAt: new Date() } }
  //   );

  //   if (result.matchedCount === 0) {
  //     return {
  //       success: false,
  //       message: 'Wallet not found or already deleted'
  //     };
  //   }

  //   return {
  //     success: true,
  //     message: 'Wallet deleted successfully'
  //   };
  // }
}
