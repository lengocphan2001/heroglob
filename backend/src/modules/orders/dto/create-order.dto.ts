import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  productId!: number;

  @IsString()
  @MaxLength(42)
  walletAddress!: string;

  @IsString()
  @IsIn(['usdt', 'hero'])
  tokenType!: 'usdt' | 'hero';

  @IsString()
  @MaxLength(50)
  amount!: string;

  @IsOptional()
  @IsString()
  @MaxLength(66)
  txHash?: string | null;
}
