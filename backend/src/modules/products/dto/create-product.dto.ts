import { IsBoolean, IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @MaxLength(512)
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  creatorAvatarUrl?: string | null;

  @IsString()
  @MaxLength(100)
  creatorHandle!: string;

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
}
