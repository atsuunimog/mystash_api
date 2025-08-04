import { Controller, Get, Query } from '@nestjs/common';
import { PaginatedResponse } from '../../common/interfaces';
import { TransferService } from './transfer.service';

@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get()
  async getAllTransfers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.transferService.getAllTransfers(pageNum, limitNum);
  }
}
