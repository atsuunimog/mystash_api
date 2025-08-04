import { Injectable } from '@nestjs/common';
import { Interests, InterestsDocument } from './interests.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/common';
import { CreateInterestDto, UpdateInterestDto } from './dto';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interests.name, 'service-db')
    private readonly interestsModel: Model<InterestsDocument>,
  ) {}

  // This service will contain methods to interact with the Interests model
  async getAllInterests(): Promise<ApiResponse<Interests[]>> {
    // Logic to fetch all interests
    try {
      const interests = await this.interestsModel.find().exec();
      if (!interests) {
        return {
          success: false,
          message: 'No interests found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Interests retrieved successfully',
        data: interests,
      };
    } catch (error) {
      throw new Error(`Failed to fetch interests: ${error.message}`);
    }
  }

  async getActiveInterests(): Promise<ApiResponse<Interests[]>> {
    try {
      const interests = await this.interestsModel
        .find({
          active: true,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'Active interests retrieved successfully',
        data: interests,
      };
    } catch (error) {
      throw new Error(`Failed to fetch active interests: ${error.message}`);
    }
  }

  async createInterest(
    createInterestDto: CreateInterestDto,
  ): Promise<ApiResponse<Interests>> {
    try {
      const newInterest = new this.interestsModel(createInterestDto);
      const savedInterest = await newInterest.save();

      return {
        success: true,
        message: 'Interest created successfully',
        data: savedInterest,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Interest with this publicId already exists');
      }
      throw new Error(`Failed to create interest: ${error.message}`);
    }
  }

  async updateInterest(
    id: string,
    updateInterestDto: UpdateInterestDto,
  ): Promise<ApiResponse<Interests>> {
    try {
      const updatedInterest = await this.interestsModel
        .findByIdAndUpdate(id, updateInterestDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedInterest) {
        return {
          success: false,
          message: 'Interest not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Interest updated successfully',
        data: updatedInterest,
      };
    } catch (error) {
      throw new Error(`Failed to update interest: ${error.message}`);
    }
  }

  async getInterestById(id: string): Promise<ApiResponse<Interests>> {
    try {
      const interest = await this.interestsModel.findById(id).exec();

      if (!interest) {
        return {
          success: false,
          message: 'Interest not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Interest retrieved successfully',
        data: interest,
      };
    } catch (error) {
      throw new Error(`Failed to fetch interest: ${error.message}`);
    }
  }

  async getInterestByPublicId(
    publicId: string,
  ): Promise<ApiResponse<Interests>> {
    try {
      const interest = await this.interestsModel.findOne({ publicId }).exec();

      if (!interest) {
        return {
          success: false,
          message: 'Interest not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Interest retrieved successfully',
        data: interest,
      };
    } catch (error) {
      throw new Error(`Failed to fetch interest by publicId: ${error.message}`);
    }
  }

  async getInterestsByAuth(authId: string): Promise<ApiResponse<Interests[]>> {
    try {
      const interests = await this.interestsModel
        .find({
          auth: authId,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'User interests retrieved successfully',
        data: interests,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user interests: ${error.message}`);
    }
  }

  async getInterestsByProfile(
    profileId: string,
  ): Promise<ApiResponse<Interests[]>> {
    try {
      const interests = await this.interestsModel
        .find({
          profile: profileId,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'Profile interests retrieved successfully',
        data: interests,
      };
    } catch (error) {
      throw new Error(`Failed to fetch profile interests: ${error.message}`);
    }
  }

  async getInterestsByCurrency(
    currency: string,
  ): Promise<ApiResponse<Interests[]>> {
    try {
      const interests = await this.interestsModel
        .find({
          currency,
          active: true,
          deleted: false,
        })
        .exec();

      return {
        success: true,
        message: 'Currency interests retrieved successfully',
        data: interests,
      };
    } catch (error) {
      throw new Error(`Failed to fetch currency interests: ${error.message}`);
    }
  }

  async deleteInterest(id: string): Promise<ApiResponse<Interests>> {
    try {
      const deletedInterest = await this.interestsModel
        .findByIdAndUpdate(id, { deleted: true, active: false }, { new: true })
        .exec();

      if (!deletedInterest) {
        return {
          success: false,
          message: 'Interest not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Interest deleted successfully',
        data: deletedInterest,
      };
    } catch (error) {
      throw new Error(`Failed to delete interest: ${error.message}`);
    }
  }
}
