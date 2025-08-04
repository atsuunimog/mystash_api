import { Controller, Get, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PaginatedResponse } from '../../common/interfaces';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.accountsService.getAllAccounts(pageNum, limitNum);
  }
}
