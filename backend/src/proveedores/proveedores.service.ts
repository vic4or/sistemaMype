import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProveedorDto } from './dto/create-proveedor.dto'
import { UpdateProveedorDto } from './dto/update-proveedor.dto'

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProveedorDto: CreateProveedorDto) {
    return await this.prisma.pro_proveedores.create({
      data: {
        ...createProveedorDto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    })
  }

  async findAll() {
    return await this.prisma.pro_proveedores.findMany()
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.pro_proveedores.findUnique({
      where: { proveedor_id: id },
    })

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`)
    }

    return await proveedor
  }

  async update(id: number, updateColorDto: UpdateProveedorDto) {
    await this.findOne(id)

    return await this.prisma.pro_proveedores.update({
      where: { proveedor_id: id },
      data: {
        ...updateColorDto,
        fecha_modificacion: new Date(),
      },
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.prisma.pro_proveedores.update({
      where: { proveedor_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    })
  }
}