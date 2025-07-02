import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService, PrismaService],
})
export class MaterialModule {}
