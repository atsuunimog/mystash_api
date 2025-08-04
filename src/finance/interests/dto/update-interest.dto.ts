import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';

export class UpdateInterestDto {
  @IsMongoId()
  @IsOptional()
  auth?: string;

  @IsMongoId()
  @IsOptional()
  profile?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  startDay?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  endDay?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
