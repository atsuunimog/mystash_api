import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.paymentsService.getAllPayments(pageNum, limitNum);
  }

  @Get('stats')
  async getStats(@Query('uid') uid?: string) {
    try {
      const stats = await this.paymentsService.getPaymentStats(uid);
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payment statistics',
        error: error.message,
      };
    }
  }

  @Get('by-reference/:reference')
  async findByReference(@Param('reference') reference: string) {
    try {
      const payment = await this.paymentsService.findByReference(reference);
      if (!payment) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Payment not found',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payment',
        error: error.message,
      };
    }
  }

  @Get('by-status/:status')
  async findByStatus(@Param('status') status: string) {
    try {
      const payments = await this.paymentsService.findByStatus(status);
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments by status retrieved successfully',
        data: payments,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payments by status',
        error: error.message,
      };
    }
  }

  @Get('by-type/:type')
  async findByType(@Param('type') type: string) {
    try {
      const payments = await this.paymentsService.findByType(type);
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments by type retrieved successfully',
        data: payments,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payments by type',
        error: error.message,
      };
    }
  }

  @Get('by-category/:category')
  async findByCategory(@Param('category') category: string) {
    try {
      const payments = await this.paymentsService.findByCategory(category);
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments by category retrieved successfully',
        data: payments,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payments by category',
        error: error.message,
      };
    }
  }

  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('uid') uid?: string,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const payments = await this.paymentsService.getPaymentsByDateRange(
        start,
        end,
        uid,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments by date range retrieved successfully',
        data: payments,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve payments by date range',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.findOne(id);
      if (!payment) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Payment not found',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve payment',
        error: error.message,
      };
    }
  }
}
