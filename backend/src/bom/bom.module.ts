import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BomController],
  providers: [BomService, PrismaService],
})
export class BomModule {}