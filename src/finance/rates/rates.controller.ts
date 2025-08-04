import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  async getAllRates() {
    return await this.ratesService.getAllRates();
  }

  @Get('active')
  async getActiveRates() {
    return await this.ratesService.getActiveRates();
  }

  @Get('currency-pair')
  async getRateByCurrencyPair(
    @Query('source') sourceCurrency: string,
    @Query('destination') destinationCurrency: string,
  ) {
    if (!sourceCurrency || !destinationCurrency) {
      throw new NotFoundException(
        'Source and destination currencies are required',
      );
    }
    return await this.ratesService.getRateByCurrencyPair(
      sourceCurrency,
      destinationCurrency,
    );
  }

  @Get('public/:publicId')
  async getRateByPublicId(@Param('publicId') publicId: string) {
    const result = await this.ratesService.getRateByPublicId(publicId);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }

  @Get(':id')
  async getRateById(@Param('id') id: string) {
    const result = await this.ratesService.getRateById(id);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }
}
