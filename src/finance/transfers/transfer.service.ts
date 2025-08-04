import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from 'src/common/interfaces';
import { Transfers, TransfersDocument } from './transfer.schema'; // Assuming you have a Transfer schema defined
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TransferService {
  constructor(
    @InjectModel(Transfers.name, 'service-db')
    private readonly transferModel: Model<TransfersDocument>,
  ) {}

  async getAllTransfers(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [transfers, total] = await Promise.all([
      this.transferModel.aggregate([
        { $match: { deleted: false } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            deleted: 1,
            auth: 1,
            profile: 1,
            sourceCurrency: 1,
            fundingSource: 1,
            destinationCurrency: 1,
            sourceAmount: 1,
            convertedAmount: 1,
            country: 1,
            paymentMethod: 1,
            beneficiary: {
              type: '$beneficiary.type',
              companyName: '$beneficiary.companyName',
              email: '$beneficiary.email',
              firstName: '$beneficiary.firstName',
              lastName: '$beneficiary.lastName',
              address: '$beneficiary.address',
              mobile: {
                phoneNumber: '$beneficiary.mobile.phoneNumber',
                isoCode: '$beneficiary.mobile.isoCode',
              },
            },
            account: {
              accountNumber: '$account.accountNumber',
              sortCode: '$account.sortCode',
              swiftCode: '$account.swiftCode',
            },
            rate: 1,
            narration: 1,
            currencyPair: 1,
            status: 1,
            active: 1,
            publicId: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),

      this.transferModel.countDocuments({ deleted: false }),
    ]);

    return {
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  // This service will handle transfer-related business logic
  // Methods for handling transfers will be added here in the future

  //   async function getTransferDetails() {
  //     // This function will retrieve transfer details
  //     // Implementation will be added later
  //   }
}
