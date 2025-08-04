import { Injectable } from "@nestjs/common";
import { Stashes, StashesDocument } from "./stashes.schema";
import { User, UserDocument } from "../../user/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PaginatedResponse, ApiResponse } from "../../common/interfaces";

@Injectable()
export class StashesService {
  constructor(
    @InjectModel(Stashes.name, 'service-db') private stashesModel: Model<StashesDocument>,
    @InjectModel(User.name, 'auth-db') private userModel: Model<UserDocument>,
  ) {}

  async getAllStashes(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [stashes, total] = await Promise.all([
      this.stashesModel.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            interest: 1,
            auth: 1,
            profile: 1,
            name: 1,
            saveType: 1,
            currency: 1,
            target: 1,
            currentInterest: 1,
            duration: 1,
            automation: 1,
            strictStatus: 1,
            startSaveOn: 1,
            balance: 1,
            fundingSources: 1,
            processor: 1,
            interestData: 1,
            publicId: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ]),
      this.stashesModel.countDocuments({ deleted: { $ne: true } })
    ]);

    return {
      data: stashes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getStashById(id: string): Promise<ApiResponse<Stashes>> {
    try {
        console.log('LOGGED Fetching stash by ID:', id);
      // Validate the ID format
      const stash = await this.stashesModel.findOne({
        _id: new Types.ObjectId(id),
        deleted: { $ne: true }
      });

      if (!stash) {
        return {
          success: false,
          message: 'Stash not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Stash retrieved successfully',
        data: stash
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve stash',
        data: null
      };
    }
  }

    async getStashesByAuthId(
        authId: string,
        page = 1,
        limit = 20
    ): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
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


  async getStashesBySaveType(saveType: string, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
    try {
      const validSaveTypes = ['salary','regular', 'target', 'flex'];
      if (!validSaveTypes.includes(saveType)) {
        return {
          success: false,
          message: 'Invalid save type. Must be one of: regular, target, flex',
          data: null
        };
      }

      const skip = (page - 1) * limit;
      const [stashes, total] = await Promise.all([
        this.stashesModel.find({
          saveType,
          deleted: { $ne: true }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
        this.stashesModel.countDocuments({
          saveType,
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
        message: `Stashes of type '${saveType}' retrieved successfully`,
        data: paginatedData
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve stashes by save type',
        data: null
      };
    }
  }

  async getActiveStashes(authId?: string): Promise<ApiResponse<Stashes[]>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {
        deleted: { $ne: true },
        startSaveOn: { $lte: new Date() }
      };

      if (authId) {
        if (!Types.ObjectId.isValid(authId)) {
          return {
            success: false,
            message: 'Invalid auth ID format',
            data: null
          };
        }
        query.auth = new Types.ObjectId(authId);
      }

      const activeStashes = await this.stashesModel.find(query)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Active stashes retrieved successfully',
        data: activeStashes
      };
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to retrieve active stashes',
        data: null
      };
    }
  }


    async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.stashesModel
        .aggregate([
          { $match: { deleted: { $ne: true } } },
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              emailVerified: {
                $sum: { $cond: ['$verifications.email', 1, 0] },
              },
              mobileVerified: {
                $sum: { $cond: ['$verifications.mobile', 1, 0] },
              },
              bothVerified: {
                $sum: {
                  $cond: [
                    { $and: ['$verifications.email', '$verifications.mobile'] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
        .exec();

      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats[0] || {
          totalUsers: 0,
          emailVerified: 0,
          mobileVerified: 0,
          bothVerified: 0,
        },
      };
    } catch (error) {
      console.error('UserService: Database error:', error);
      throw new Error('Error fetching user statistics: ' + error.message);
    }
  }

  async getAllStashesWithUserDetails(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    
    try {
      // First get stashes without user details
      const [stashes, total] = await Promise.all([
        this.stashesModel.aggregate([
          { $match: { deleted: { $ne: true } } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              maturityDate: '$duration.endDate',
              planStatus: {
                $cond: {
                  if: { $lte: ['$duration.endDate', new Date()] },
                  then: 'matured',
                  else: {
                    $cond: {
                      if: { $gte: [new Date(), '$duration.startDate'] },
                      then: 'active',
                      else: 'pending'
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 1,
              publicId: 1,
              planName: '$name',
              saveType: 1,
              currency: 1,
              balance: 1,
              target: 1,
              maturityDate: 1,
              planStatus: 1,
              strictStatus: 1,
              currentInterest: 1,
              startSaveOn: 1,
              automation: 1,
              processor: 1,
              createdAt: 1,
              updatedAt: 1,
              auth: 1
            }
          },
          { $sort: { createdAt: -1 } }
        ]),
        this.stashesModel.countDocuments({ deleted: { $ne: true } })
      ]);

      // Extract unique auth IDs
      const authIds = [...new Set(stashes.map(stash => stash.auth?.toString()).filter(Boolean))];
      
      // Fetch users from auth-db using the auth field
      const users = await this.userModel.find({
        auth: { $in: authIds.map(id => new Types.ObjectId(id)) }
      }).lean();

      // Create a map for quick user lookup using auth field as key
      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user.auth?.toString(), user);
      });

      // Combine stashes with user details
      const stashesWithUserDetails = stashes.map(stash => {
        const user = userMap.get(stash.auth?.toString());
        return {
          ...stash,
          userFirstName: user?.firstName || 'N/A',
          userLastName: user?.lastName || 'N/A',
          userEmail: user?.email || 'N/A'
        };
      });

      return {
        data: stashesWithUserDetails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching stashes with user details:', error);
      throw new Error('Error fetching stashes with user details: ' + error.message);
    }
  }

  async getStashesByAuthIdWithDetails(
    authId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      const skip = (page - 1) * limit;
      const authObjectId = new Types.ObjectId(authId);

      const [stashesWithUser, total] = await Promise.all([
        this.stashesModel.aggregate([
          { 
            $match: { 
              deleted: { $ne: true },
              auth: authObjectId
            } 
          },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'auth',
              foreignField: '_id',
              as: 'userDetails',
              pipeline: [
                {
                  $project: {
                    publicId: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    mobile: 1,
                    verifications: 1,
                    createdAt: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              user: { $arrayElemAt: ['$userDetails', 0] },
              userFirstName: '$user.firstName',
              userLastName: '$user.lastName',
              maturityDate: '$duration.endDate',
              planStatus: {
                $cond: {
                  if: { $lte: ['$duration.endDate', new Date()] },
                  then: 'matured',
                  else: {
                    $cond: {
                      if: { $gte: [new Date(), '$duration.startDate'] },
                      then: 'active',
                      else: 'pending'
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 1,
              publicId: 1,
              planName: '$name',
              saveType: 1,
              currency: 1,
              balance: 1,
              target: 1,
              maturityDate: 1,
              planStatus: 1,
              strictStatus: 1,
              currentInterest: 1,
              startSaveOn: 1,
              automation: 1,
              processor: 1,
              createdAt: 1,
              updatedAt: 1,
              user: 1,
              userFirstName: '$user.firstName',
              userLastName: '$user.lastName'
            }
          },
          { $sort: { createdAt: -1 } }
        ]),
        this.stashesModel.countDocuments({ 
          deleted: { $ne: true },
          auth: authObjectId
        })
      ]);

      return {
        success: true,
        message: 'Stashes retrieved successfully',
        data: {
          data: stashesWithUser,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching stashes by auth ID with details:', error);
      return {
        success: false,
        message: 'Error fetching stashes: ' + error.message,
        data: null
      };
    }
  }
}
