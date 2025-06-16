import { Module } from '@nestjs/common';
import { CategoriasMaterialService } from './categorias-material.service';
import { CategoriasMaterialController } from './categorias-material.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriasMaterialController],
  providers: [CategoriasMaterialService],
  exports: [CategoriasMaterialService],
})
export class CategoriasMaterialModule {}