import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { StashesService } from './stashes.service';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces';
import { Stashes } from './stashes.schema';

@Controller('stashes')
export class StashesController {
  constructor(private readonly stashesService: StashesService) {}

@Get()
  async getAllStashes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.stashesService.getAllStashes(pageNum, limitNum);
  }

@Get('stash/:id')
    async getStashById(@Param('id') id: string): Promise<ApiResponse<Stashes>> {
    console.log('Fetching stash by ID:', id);
    // Log the ID being fetched for debugging purposes...
    const result = await this.stashesService.getStashById(id);
    if (!result.success) {
        throw new NotFoundException(result.message);
    }
    return result;
}

@Get('auth/:authId')
async getStashesByAuthId(   
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.stashesService.getStashesByAuthId(
    authId,
    pageNum,
    limitNum,
    );
    if (!result.success) {
    throw new NotFoundException(result.message);
    }
    return result;
}

@Get('save-type/:saveType')
async getStashesBySaveType(
    @Param('saveType') saveType: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    ): Promise<ApiResponse<PaginatedResponse<Stashes>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.stashesService.getStashesBySaveType(
        saveType,
        pageNum,
        limitNum,
    );
    if (!result.success) {
        throw new NotFoundException(result.message);
    }
    return result;
}

@Get('active')
async getActiveStashes(
    @Query('authId') authId?: string,
    ): Promise<ApiResponse<Stashes[]>> {
    const result = await this.stashesService.getActiveStashes(authId);
    if (!result.success) {
        throw new NotFoundException(result.message);
    }
    return result;
}


@Get('stats')
async getUserStats(): Promise<ApiResponse<any>> {
    return this.stashesService.getUserStats();
}

@Get('detailed')
async getAllStashesWithUserDetails(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.stashesService.getAllStashesWithUserDetails(pageNum, limitNum);
}

@Get('detailed/auth/:authId')
async getStashesByAuthIdWithDetails(   
    @Param('authId') authId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
): Promise<ApiResponse<PaginatedResponse<any>>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.stashesService.getStashesByAuthIdWithDetails(
        authId,
        pageNum,
        limitNum,
    );
    if (!result.success) {
        throw new NotFoundException(result.message);
    }
    return result;
}


}
