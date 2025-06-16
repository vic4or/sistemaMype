import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    return await this.prisma.cli_clientes.create({
        data: {
        ...createClienteDto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    })
  }

  async findAll() {
    return await this.prisma.cli_clientes.findMany()
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cli_clientes.findUnique({ where: { cliente_id: id } })

    if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
  
      return await cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    await this.findOne(id)

    return await this.prisma.cli_clientes.update({
      where: { cliente_id: id },
      data: {
        ...updateClienteDto,
        fecha_modificacion: new Date(),
      },
    })
  }

  async remove(id: number) {
    await this.findOne(id); 

    return await this.prisma.cli_clientes.update({
      where: { cliente_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });

  }
}