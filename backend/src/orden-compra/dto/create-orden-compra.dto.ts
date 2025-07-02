import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsDecimal,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrdenCompraDetalleDto {
  @IsNotEmpty()
  @IsInt()
  material_id: number;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,3' })
  @Min(0.001)
  cantidad: number;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,3' })
  @Min(0.001)
  precio_unitario: number;
}

export class CreateOrdenCompraDto {
  @IsNotEmpty()
  @IsInt()
  proveedor_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  fecha_emision_oc: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_esperada: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nota?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrdenCompraDetalleDto)
  items: CreateOrdenCompraDetalleDto[];
}