import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColoresService {
  constructor(private prisma: PrismaService) {}

  async create(createColorDto: CreateColorDto) {
    return await this.prisma.cfg_colores.create({
        data: {
          ...createColorDto,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
      });
  }

  async findAll() {
    return await this.prisma.cfg_colores.findMany();
  }

  async findOne(id: number) {
    const color = await this.prisma.cfg_colores.findUnique({
      where: { 
        color_id: id 
        },
    });

    if (!color) {
      throw new NotFoundException(`Color con ID ${id} no encontrado`);
    }

    return await color;
  }

  async update(id: number, updateColorDto: UpdateColorDto) {
    await this.findOne(id); 

    return await this.prisma.cfg_colores.update({
        where: { color_id: id },
        data: {
          ...updateColorDto,
          fecha_modificacion: new Date(),
        },
      });
  }

  async remove(id: number) {
    await this.findOne(id); 

    return await this.prisma.cfg_colores.update({
      where: { color_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }
}