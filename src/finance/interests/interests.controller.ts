import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto, UpdateInterestDto } from './dto';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  async getAllInterests() {
    return await this.interestsService.getAllInterests();
  }

  @Get('active')
  async getActiveInterests() {
    return await this.interestsService.getActiveInterests();
  }

  @Get('currency/:currency')
  async getInterestsByCurrency(@Param('currency') currency: string) {
    if (!currency) {
      throw new NotFoundException('Currency is required');
    }
    return await this.interestsService.getInterestsByCurrency(currency);
  }

  @Get('auth/:authId')
  async getInterestsByAuth(@Param('authId') authId: string) {
    if (!authId) {
      throw new NotFoundException('Auth ID is required');
    }
    return await this.interestsService.getInterestsByAuth(authId);
  }

  @Get('profile/:profileId')
  async getInterestsByProfile(@Param('profileId') profileId: string) {
    if (!profileId) {
      throw new NotFoundException('Profile ID is required');
    }
    return await this.interestsService.getInterestsByProfile(profileId);
  }

  @Get('public/:publicId')
  async getInterestByPublicId(@Param('publicId') publicId: string) {
    if (!publicId) {
      throw new NotFoundException('Public ID is required');
    }

    const result = await this.interestsService.getInterestByPublicId(publicId);

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return result;
  }

  @Get(':id')
  async getInterestById(@Param('id') id: string) {
    const result = await this.interestsService.getInterestById(id);

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInterest(@Body() createInterestDto: CreateInterestDto) {
    return await this.interestsService.createInterest(createInterestDto);
  }

  @Put(':id')
  async updateInterest(
    @Param('id') id: string,
    @Body() updateInterestDto: UpdateInterestDto,
  ) {
    const result = await this.interestsService.updateInterest(
      id,
      updateInterestDto,
    );

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return result;
  }

  @Delete(':id')
  async deleteInterest(@Param('id') id: string) {
    const result = await this.interestsService.deleteInterest(id);

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return result;
  }
}
