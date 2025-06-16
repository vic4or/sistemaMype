import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaMaterialDto } from './dto/create-categoria-material.dto'
import { UpdateCategoriaMaterialDto } from './dto/update-categoria-material.dto';

@Injectable()
export class CategoriasMaterialService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaMaterialDto: CreateCategoriaMaterialDto) {
    return await this.prisma.cfg_categorias_material.create({
      data: {
        ...createCategoriaMaterialDto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    });
  }

  async findAll() {
    return await this.prisma.cfg_categorias_material.findMany();
  }

  async findOne(id: number) {
    const categoria = await this.prisma.cfg_categorias_material.findUnique({
      where: {
        categoria_material_id: id,
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return await categoria;
  }

  async update(id: number, updateCategoriaMaterialDto: UpdateCategoriaMaterialDto) {
    await this.findOne(id);

    return await this.prisma.cfg_categorias_material.update({
      where: {
        categoria_material_id: id,
      },
      data: {
        ...updateCategoriaMaterialDto,
        fecha_modificacion: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.cfg_categorias_material.update({
      where: {
        categoria_material_id: id,
      },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }
}