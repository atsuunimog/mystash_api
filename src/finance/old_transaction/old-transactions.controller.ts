import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { OldTransactionsService } from './old-transactions.service';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces';
import { OldTransactions } from './old-transactions.schema';

@Controller('old-transactions')
export class OldTransactionsController {
  constructor(
    private readonly oldTransactionsService: OldTransactionsService,
  ) {}

  @Get()
  async getAllTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.oldTransactionsService.getAllTransactions(pageNum, limitNum);
  }

  @Get('tnx/:id')
  async getTransactionById(
    @Param('id') id: string,
  ): Promise<ApiResponse<OldTransactions>> {
    const result = await this.oldTransactionsService.getTransactionById(id);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('recent/:uid')
  async getUserRecentTransactions(
    @Param('uid') uid: string,
  ): Promise<ApiResponse<any>> {
    const result =
      await this.oldTransactionsService.getUserRecentTransactions(uid);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('user/email/:email')
  async getTransactionsByEmail(
    @Param('email') email: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<OldTransactions>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.oldTransactionsService.getTransactionsByEmail(
      email,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('date-range')
  async getTransactionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('uid') uid?: string,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date format. Please use YYYY-MM-DD format.',
        };
      }

      if (start > end) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Start date cannot be later than end date.',
        };
      }

      const result =
        await this.oldTransactionsService.getTransactionsByDateRange(
          start,
          end,
          uid,
        );

      if (!result.success) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: result.message,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transactions by date range',
        error: error.message,
      };
    }
  }
}
