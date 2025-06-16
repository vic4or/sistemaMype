import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(private prisma: PrismaService) {}

  async create(createUnidadMedidaDto: CreateUnidadMedidaDto) {

    return await this.prisma.cfg_unidades_medida.create({
        data: {
          ...createUnidadMedidaDto,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
      });
  }

  async findAll() {
    return await this.prisma.cfg_unidades_medida.findMany();
  }

  async findOne(id: number) {
    const unidad = await this.prisma.cfg_unidades_medida.findUnique({
      where: { unidad_medida_id: id },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad de medida con ID ${id} no encontrada`);
    }

    return await unidad;
  }

  async update(id: number, updateUnidadMedidaDto: UpdateUnidadMedidaDto) {
    await this.findOne(id);


    return await this.prisma.cfg_unidades_medida.update({
        where: { unidad_medida_id: id },
        data: {
          ...updateUnidadMedidaDto,
          fecha_modificacion: new Date(),
        },
      });
    
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.cfg_unidades_medida.update({
      where: { unidad_medida_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }
}