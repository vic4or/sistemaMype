import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common'
  import { ProveedoresService } from './proveedores.service'
  import { CreateProveedorDto } from './dto/create-proveedor.dto'
  import { UpdateProveedorDto } from './dto/update-proveedor.dto'
  
  @Controller('proveedores')
  export class ProveedoresController {
    constructor(private readonly proveedoresService: ProveedoresService) {}
  
    @Post()
    create(@Body() dto: CreateProveedorDto) {
      return this.proveedoresService.create(dto)
    }
  
    @Get()
    findAll() {
      return this.proveedoresService.findAll()
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.proveedoresService.findOne(id)
    }
  
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProveedorDto) {
      return this.proveedoresService.update(id, dto)
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.proveedoresService.remove(id)
    }
  }