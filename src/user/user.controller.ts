import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { PaginatedResponse, ApiResponse } from '../common/interfaces';
import { Stashes } from '../finance/stashes/stashes.schema';
import { Wallets } from '../finance/wallets/wallets.schema';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedResponse<User>> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.userService.findAll(pageNum, limitNum);
  }

  @Get('email/:email')
  async getUserByEmail(
    @Param('email') email: string,
  ): Promise<ApiResponse<User>> {
    const result = await this.userService.findByEmail(email);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':authId/stashes')
  async getStashesByAuthId(
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.userService.getStashesByAuthId(
      authId,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':authId/stash-stats')
  async getUserStashStats(
    @Param('authId') authId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.userService.getUserStashStats(authId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':authId/wallets')
  async getWalletsByAuthId(
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Wallets>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.userService.getWalletsByAuthId(
      authId,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('aggregate/balances')
  async getAggregateUserBalances(): Promise<ApiResponse<any>> {
    const result = await this.userService.getAggregateUserBalances();
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':authId/aggregate')
  async getUserAggregateData(
    @Param('authId') authId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.userService.getUserAggregateData(authId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':authId/balances')
  async getUserBalances(
    @Param('authId') authId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.userService.getUserBalances(authId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }



  


}
