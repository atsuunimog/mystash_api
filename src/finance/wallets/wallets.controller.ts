import { Controller, Get, Query, Param } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { PaginatedResponse } from '../../common/interfaces';
import { Wallets } from './wallets.schema';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<Wallets>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.walletsService.getAllWallets(pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Wallets | null> {
    return await this.walletsService.findOne(id);
  }

}
