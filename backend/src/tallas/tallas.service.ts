import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTallaDto } from './dto/create-talla.dto';
import { UpdateTallaDto } from './dto/update-talla.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TallasService {
  constructor(private prisma: PrismaService) {}

  async create(createTallaDto: CreateTallaDto) {

    return await this.prisma.cfg_tallas.create({
        data: {
          ...createTallaDto,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
    });
  }

  async findAll() {
    
    return await this.prisma.cfg_tallas.findMany();
  }

  async findOne(id: number) {
    const talla = await this.prisma.cfg_tallas.findUnique({
      where: { talla_id: id }
    });

    if (!talla) {
      throw new NotFoundException(`Talla con ID ${id} no encontrada`);
    }

    return talla;
  }

  async update(id: number, updateTallaDto: UpdateTallaDto) {
    await this.findOne(id);

    return await this.prisma.cfg_tallas.update({
        where: { talla_id: id },
        data: {
          ...updateTallaDto,
          fecha_modificacion: new Date(),
        },
      });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.cfg_tallas.update({
      where: { talla_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }
}