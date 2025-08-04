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

export class CreateInterestDto {
  @IsMongoId()
  @IsNotEmpty()
  auth: string;

  @IsMongoId()
  @IsNotEmpty()
  profile: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  startDay?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  endDay: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsNotEmpty()
  publicId: string;
}
