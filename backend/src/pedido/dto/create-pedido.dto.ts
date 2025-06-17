import {
    IsNotEmpty,
    IsInt,
    IsDateString,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreatePedidoDetalleDto {
    @IsNotEmpty()
    @IsInt()
    producto_tal_col_id: number;
  
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    cantidad_solicitada: number;
  }
  
  export class CreatePedidoDto {
    @IsNotEmpty()
    @IsInt()
    cliente_id: number;
  
    @IsNotEmpty()
    @IsInt()
    producto_id: number;
  
    @IsNotEmpty()
    @IsDateString()
    fecha_pedido: string;
  
    @IsNotEmpty()
    @IsDateString()
    fecha_entrega: string;
  
    @IsNotEmpty()
    @IsString()
    direccion_envio: string;
  
    @IsOptional()
    @IsString()
    observaciones?: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePedidoDetalleDto)
    detalles: CreatePedidoDetalleDto[];
  }