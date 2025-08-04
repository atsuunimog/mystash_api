import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { OldUserService } from './old_user.service';
import { OldUser } from './old_user.schema';
import { OldUserStatistics } from './old_user-statistics.schema';
import { Transactions } from '../finance/transactions/transactions.schema';
import { Payments } from '../finance/payments/payments.schema';
import { PaginatedResponse, ApiResponse } from '../common/interfaces';

@Controller('old-users')
export class OldUserController {
  constructor(private readonly oldUserService: OldUserService) {}

  @Get()
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<OldUser>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.oldUserService.getAllUsers(pageNum, limitNum);
  }

  @Get('email/:email')
  async getUserByEmail(
    @Param('email') email: string,
  ): Promise<ApiResponse<OldUser>> {
    const result = await this.oldUserService.getUserByEmail(email);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('uid/:uid')
  async getUserByUID(@Param('uid') uid: string): Promise<ApiResponse<OldUser>> {
    const result = await this.oldUserService.getUserByUID(uid);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('statistics/:uid')
  async getUserStatistics(
    @Param('uid') uid: string,
  ): Promise<ApiResponse<OldUserStatistics>> {
    const result = await this.oldUserService.getUserStatistics(uid);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('transactions/:uid')
  async getUserTransactions(
    @Param('uid') uid: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.oldUserService.getUserTransactions(
      uid,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('payments/:uid')
  async getUserPayments(
    @Param('uid') uid: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Payments>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.oldUserService.getUserPayments(
      uid,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('payment-stats/:uid')
  async getUserPaymentStats(
    @Param('uid') uid: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.oldUserService.getUserPaymentStats(uid);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }
}
