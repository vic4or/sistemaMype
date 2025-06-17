import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCombinacionDto {
  @IsNotEmpty()
  @IsNumber()
  producto_id: number;

  @IsNotEmpty()
  @IsNumber()
  talla_id: number;

  @IsNotEmpty()
  @IsNumber()
  color_id: number;

  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsNumber()
  precio_venta: number;

  @IsOptional()
  @IsString()
  usuario_creacion?: string;
}