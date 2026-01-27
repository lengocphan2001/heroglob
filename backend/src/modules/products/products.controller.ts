import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCTS_UPLOAD = 'uploads/products';

function safeFilename(original: string): string {
  const ext = original.replace(/^.*\./, '') || 'jpg';
  const base = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  return `${base}.${ext}`;
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Post('upload/image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), PRODUCTS_UPLOAD);
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
      }),
    }),
  )
  uploadImage(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) throw new BadRequestException('Chưa chọn file');
    const prefix = this.config.get<string>('app.prefix', 'api');
    const publicUrl = this.config.get<string>('app.publicUrl', 'http://localhost:4000').replace(/\/$/, '');
    const url = `${publicUrl}/${prefix}/uploads/products/${file.filename}`;
    return { url };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOneBySlug(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
    if (numericId === null) throw new BadRequestException('Admin update requires numeric product id');
    return this.productsService.update(numericId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
    if (numericId === null) throw new BadRequestException('Admin delete requires numeric product id');
    return this.productsService.remove(numericId);
  }
}
