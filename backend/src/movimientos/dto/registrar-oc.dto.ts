import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MovimientoOCItemDto {
  @IsNumber()
  oc_detalle_id: number;

  @IsNumber()
  cantidad_recibida: number;

  @IsEnum(['OK', 'DISCREPANCIA'])
  estado_discrepancia: 'OK' | 'DISCREPANCIA';

  @IsOptional()
  @IsString()
  nota_discrepancia?: string;
}

export class RegistrarEntradaOCDto {
  @IsDateString()
  fecha_movimiento: string;

  @IsString()
  usuario: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovimientoOCItemDto)
  items: MovimientoOCItemDto[];
}