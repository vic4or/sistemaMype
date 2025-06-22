import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTizadoDto } from './dto/create-tizado.dto';
import { UpdateTizadoDto } from './dto/update-tizado.dto';
import { CreateTizadoTallaDto } from './dto/create-tizado-talla.dto';
import { UpdateTizadoTallaDto } from './dto/update-tizado-talla.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TizadoService {
  constructor(private prisma: PrismaService) {}

  // Métodos para Definiciones de Tizado (Cabecera)
  async create(createTizadoDto: CreateTizadoDto) {
    try {
      return await this.prisma.ped_definiciones_tizado.create({
    data: {
        ped_pedidos_cliente: {
        connect: { pedido_cliente_id: createTizadoDto.pedido_cliente_id }
        },
        descripcion_tizado: createTizadoDto.descripcion_tizado,
        ancho_tela_ref_metros: createTizadoDto.ancho_tela,
        longitud_tela_metros: createTizadoDto.largo,

        ped_def_tizado_tallas: {
        create: createTizadoDto.tallas.map((t) => ({
            talla_id: t.talla_id,
            cant_prendas_tendida: t.cantidad,
        }))
        }
    },
    include: {
        ped_pedidos_cliente: true,
        ped_def_tizado_tallas: {
        include: { cfg_tallas: true }
        }
    }
    });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('La definición de tizado ya existe');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('El pedido cliente especificado no existe');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.ped_definiciones_tizado.findMany({
        include: {
          ped_pedidos_cliente: {
            include: {
              cli_clientes: true, 
              prd_productos: true,   
            },
          },
          ped_def_tizado_tallas: {
            include: {
              cfg_tallas: true,
            },
          },
        }
      });
    }
    
  async findOne(id: number) {
    const tizado = await this.prisma.ped_definiciones_tizado.findUnique({
      where: { definicion_tizado_id: id },
      include: {
        ped_pedidos_cliente: {
            include: {
              cli_clientes: true, 
              prd_productos: true,   
            },
          },
        ped_def_tizado_tallas: {
          include: {
            cfg_tallas: true,
          },
          orderBy: { talla_id: 'asc' },
        },
      },
    });

    if (!tizado) {
      throw new NotFoundException(`Definición de tizado con ID ${id} no encontrada`);
    }

    return tizado;
  }

  async update(id: number, updateTizadoDto: UpdateTizadoDto) {
    await this.findOne(id); // Verificar que existe

    try {
      return await this.prisma.ped_definiciones_tizado.update({
        where: { definicion_tizado_id: id },
        data: {
          ...updateTizadoDto,
          fecha_modificacion: new Date(),
        },
        include: {
          ped_pedidos_cliente: true,
          ped_def_tizado_tallas: {
            include: {
              cfg_tallas: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('El pedido cliente especificado no existe');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    // Soft delete
    return await this.prisma.ped_definiciones_tizado.update({
      where: { definicion_tizado_id: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }

  // Métodos para Tallas del Tizado (Detalle)
  async createTalla(definicionTizadoId: number, createTizadoTallaDto: CreateTizadoTallaDto) {
    // Verificar que la definición de tizado existe
    await this.findOne(definicionTizadoId);

    try {
      return await this.prisma.ped_def_tizado_tallas.create({
        data: {
          ...createTizadoTallaDto,
          definicion_tizado_id: definicionTizadoId,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
        include: {
          cfg_tallas: true,
          ped_definiciones_tizado: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe una definición para esta talla en este tizado');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('La talla especificada no existe');
        }
      }
      throw error;
    }
  }

  async findTallas(definicionTizadoId: number) {
    // Verificar que la definición de tizado existe
    await this.findOne(definicionTizadoId);

    return await this.prisma.ped_def_tizado_tallas.findMany({
      where: { 
        definicion_tizado_id: definicionTizadoId,
        estado: true,
      },
      include: {
        cfg_tallas: true,
      },
      orderBy: { talla_id: 'asc' },
    });
  }

  async findOneTalla(definicionTizadoId: number, tallaId: number) {
    const tizadoTalla = await this.prisma.ped_def_tizado_tallas.findFirst({
      where: {
        definicion_tizado_id: definicionTizadoId,
        def_tizado_talla_id: tallaId,
      },
      include: {
        cfg_tallas: true,
        ped_definiciones_tizado: true,
      },
    });

    if (!tizadoTalla) {
      throw new NotFoundException(`Talla con ID ${tallaId} no encontrada en el tizado ${definicionTizadoId}`);
    }

    return tizadoTalla;
  }

  async updateTalla(definicionTizadoId: number, tallaId: number, updateTizadoTallaDto: UpdateTizadoTallaDto) {
    await this.findOneTalla(definicionTizadoId, tallaId); // Verificar que existe

    try {
      return await this.prisma.ped_def_tizado_tallas.update({
        where: { def_tizado_talla_id: tallaId },
        data: {
          ...updateTizadoTallaDto,
          fecha_modificacion: new Date(),
        },
        include: {
          cfg_tallas: true,
          ped_definiciones_tizado: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('La talla especificada no existe');
        }
      }
      throw error;
    }
  }

  async removeTalla(definicionTizadoId: number, tallaId: number) {
    await this.findOneTalla(definicionTizadoId, tallaId); // Verificar que existe

    // Soft delete
    return await this.prisma.ped_def_tizado_tallas.update({
      where: { def_tizado_talla_id: tallaId },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
      },
    });
  }
}