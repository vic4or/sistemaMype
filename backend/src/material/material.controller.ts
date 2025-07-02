import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AsociarProveedorDto } from './dto/asociar-proveedor.dto';

@Controller('materiales')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateMaterialDto) {
    return this.materialService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(+id);
  }

  @Post(':id/proveedores')
  asociarProveedor(@Param('id') id: string, @Body() dto: AsociarProveedorDto) {
    return this.materialService.asociarProveedor(+id, dto);
  }

  @Get(':id/proveedores')
  listarProveedores(@Param('id') id: string) {
    return this.materialService.listarProveedores(+id);
  }

  @Patch('proveedores/:provId')
  actualizarProveedor(@Param('provId') provId: string, @Body() dto: AsociarProveedorDto) {
    return this.materialService.actualizarProveedor(+provId, dto);
  }

  @Get(':id/verificar-proveedor/:proveedorId')
  verificarRelacionProveedor(
    @Param('id', ParseIntPipe) material_id: number,
    @Param('proveedorId', ParseIntPipe) proveedor_id: number,
  ) {
    return this.materialService.verificarRelacionProveedor(material_id, proveedor_id);
  }

  @Get('categoria/:categoriaId')
  findByCategoria(@Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return this.materialService.findByCategoria(categoriaId);
  }
}