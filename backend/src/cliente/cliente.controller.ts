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
  import { ClientesService } from './cliente.service'
  import { CreateClienteDto } from './dto/create-cliente.dto'
  import { UpdateClienteDto } from './dto/update-cliente.dto'
  
  @Controller('clientes')
  export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}
  
    @Post()
    create(@Body() createClienteDto: CreateClienteDto) {
      return this.clientesService.create(createClienteDto)
    }
  
    @Get()
    findAll() {
      return this.clientesService.findAll()
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.clientesService.findOne(id)
    }
  
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateClienteDto: UpdateClienteDto) {
      return this.clientesService.update(id, updateClienteDto)
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.clientesService.remove(id)
    }
  }