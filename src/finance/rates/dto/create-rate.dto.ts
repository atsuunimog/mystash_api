import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateRateDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  rate: number;

  @IsString()
  @IsNotEmpty()
  sourceCurrency: string;

  @IsString()
  @IsNotEmpty()
  destinationCurrency: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fee?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsNotEmpty()
  publicId: string;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
