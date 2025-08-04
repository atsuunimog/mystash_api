import { Injectable } from '@nestjs/common';
import { Rates, RatesDocument } from './rates.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/common';
import { CreateRateDto, UpdateRateDto } from './dto';

@Injectable()
export class RatesService {
  constructor(
    @InjectModel(Rates.name, 'service-db')
    private readonly ratesModel: Model<RatesDocument>,
  ) {}

  // This service will contain methods to interact with the Rates model
  async getAllRates(): Promise<ApiResponse<Rates[]>> {
    // Logic to fetch all rates
    try {
      const rates = await this.ratesModel.find().exec();
      if (!rates) {
        return {
          success: false,
          message: 'No rates found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Rates retrieved successfully',
        data: rates,
      };
    } catch (error) {
      throw new Error(`Failed to fetch rates: ${error.message}`);
    }
  }

  // async createRate(createRateDto: CreateRateDto): Promise<ApiResponse<Rates>> {
  //     try {
  //         const newRate = new this.ratesModel(createRateDto);
  //         const savedRate = await newRate.save();

  //         return {
  //             success: true,
  //             message: 'Rate created successfully',
  //             data: savedRate
  //         };
  //     } catch (error) {
  //         if (error.code === 11000) {
  //             throw new Error('Rate with this publicId already exists');
  //         }
  //         throw new Error(`Failed to create rate: ${error.message}`);
  //     }
  // }

  // async updateRate(id: string, updateRateDto: UpdateRateDto): Promise<ApiResponse<Rates>> {
  //     try {
  //         const updatedRate = await this.ratesModel.findByIdAndUpdate(
  //             id,
  //             updateRateDto,
  //             { new: true, runValidators: true }
  //         ).exec();

  //         if (!updatedRate) {
  //             return {
  //                 success: false,
  //                 message: 'Rate not found',
  //                 data: null
  //             };
  //         }

  //         return {
  //             success: true,
  //             message: 'Rate updated successfully',
  //             data: updatedRate
  //         };
  //     } catch (error) {
  //         throw new Error(`Failed to update rate: ${error.message}`);
  //     }
  // }

  async getRateById(id: string): Promise<ApiResponse<Rates>> {
    try {
      const rate = await this.ratesModel.findById(id).exec();

      if (!rate) {
        return {
          success: false,
          message: 'Rate not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Rate retrieved successfully',
        data: rate,
      };
    } catch (error) {
      throw new Error(`Failed to fetch rate: ${error.message}`);
    }
  }

  async getRateByPublicId(publicId: string): Promise<ApiResponse<Rates>> {
    try {
      const rate = await this.ratesModel.findOne({ publicId }).exec();

      if (!rate) {
        return {
          success: false,
          message: 'Rate not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Rate retrieved successfully',
        data: rate,
      };
    } catch (error) {
      throw new Error(`Failed to fetch rate: ${error.message}`);
    }
  }

  async getActiveRates(): Promise<ApiResponse<Rates[]>> {
    try {
      const rates = await this.ratesModel
        .find({
          active: true,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'Active rates retrieved successfully',
        data: rates,
      };
    } catch (error) {
      throw new Error(`Failed to fetch active rates: ${error.message}`);
    }
  }

  async getRateByCurrencyPair(
    sourceCurrency: string,
    destinationCurrency: string,
  ): Promise<ApiResponse<Rates[]>> {
    try {
      const rates = await this.ratesModel
        .find({
          sourceCurrency,
          destinationCurrency,
          active: true,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'Rates retrieved successfully',
        data: rates,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch rates for currency pair: ${error.message}`,
      );
    }
  }

  // async deleteRate(id: string): Promise<ApiResponse<Rates>> {
  //     try {
  //         const deletedRate = await this.ratesModel.findByIdAndUpdate(
  //             id,
  //             { deleted: true },
  //             { new: true }
  //         ).exec();

  //         if (!deletedRate) {
  //             return {
  //                 success: false,
  //                 message: 'Rate not found',
  //                 data: null
  //             };
  //         }

  //         return {
  //             success: true,
  //             message: 'Rate deleted successfully',
  //             data: deletedRate
  //         };
  //     } catch (error) {
  //         throw new Error(`Failed to delete rate: ${error.message}`);
  //     }
  // }
}
