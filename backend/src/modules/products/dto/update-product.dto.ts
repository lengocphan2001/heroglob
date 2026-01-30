import { IsBoolean, IsOptional, IsString, IsIn, MaxLength, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  creatorAvatarUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  creatorHandle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  price?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  priceUsdt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  priceHero?: string;

  @IsOptional()
  @IsString()
  @IsIn(['primary', 'dark'])
  priceVariant?: 'primary' | 'dark';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsBoolean()
  live?: boolean;

  @IsOptional()
  @IsNumber()
  stock?: number;
}
