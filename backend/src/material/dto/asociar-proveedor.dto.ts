import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class AsociarProveedorDto {
  @IsNotEmpty()
  @IsNumber()
  proveedor_id: number;

  @IsOptional()
  @IsNumber()
  precio_compra?: number;

  @IsOptional()
  @IsNumber()
  moq_proveedor?: number;

}