import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces';
import { Transactions } from './transactions.schema';
import { TransactionFiltersDto } from './dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.transactionsService.getAllTransactions(pageNum, limitNum);
  }

  @Get('filtered')
  async getFilteredTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('currency') currency?: string,
    @Query('entry') entry?: string,
    @Query('sourceType') sourceType?: string,
    @Query('status') status?: string,
    @Query('authId') authId?: string,
    @Query('email') email?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('reference') reference?: string,
    @Query('destinationType') destinationType?: string,
  ): Promise<PaginatedResponse<any>> {
    const filters: TransactionFiltersDto = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      currency: currency as any,
      entry: entry as any,
      sourceType: sourceType as any,
      status: status as any,
      authId,
      email,
      startDate,
      endDate,
      reference,
      destinationType,
    };

    return this.transactionsService.getFilteredTransactions(filters);
  }

  @Get('tnx/:id')
  async getTransactionById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Transactions>> {
    const result = await this.transactionsService.getTransactionById(id);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('reference/:reference')
  async getTransactionByReference(
    @Param('reference') reference: string,
  ): Promise<ApiResponse<Transactions>> {
    const result =
      await this.transactionsService.getTransactionByReference(reference);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('recent-tnx/:authId')
  async getUserRecentTransactions(
    @Param('authId') authId: string,
  ): Promise<ApiResponse<any>> {
    const result =
      await this.transactionsService.getUserRecentTransactions(authId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('user/:authId')
  async getTransactionsByAuthId(
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.transactionsService.getTransactionsByAuthId(
      authId,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('user/:authId/filtered')
  async getFilteredTransactionsByAuthId(
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('currency') currency?: string,
    @Query('entry') entry?: string,
    @Query('sourceType') sourceType?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('reference') reference?: string,
    @Query('destinationType') destinationType?: string,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    const filters: TransactionFiltersDto = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      currency: currency as any,
      entry: entry as any,
      sourceType: sourceType as any,
      status: status as any,
      authId,
      startDate,
      endDate,
      reference,
      destinationType,
    };

    const result = await this.transactionsService.getFilteredTransactionsByAuthId(filters);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('stats/:authId')
  async getUserTransactionStats(
    @Param('authId') authId: string,
  ): Promise<ApiResponse<any>> {
    const result =
      await this.transactionsService.getUserTransactionStats(authId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get('date-range')
  async getTransactionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('authId') authId?: string,
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

      const result = await this.transactionsService.getTransactionsByDateRange(
        start,
        end,
        authId,
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

  @Get('email/:email')
  async getTransactionsByEmail(
    @Param('email') email: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<PaginatedResponse<Transactions>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.transactionsService.getTransactionsByEmail(
      email,
      pageNum,
      limitNum,
    );
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }
}
