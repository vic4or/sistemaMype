import { Module } from '@nestjs/common';
import { TallasController } from './tallas.controller';
import { TallasService } from './tallas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TallasController],
  providers: [TallasService],
  exports: [TallasService],
})
export class TallasModule {}
