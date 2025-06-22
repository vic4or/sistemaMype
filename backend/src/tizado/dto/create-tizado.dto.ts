import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDecimal,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTizadoTallaDto } from './create-tizado-talla.dto';

export class CreateTizadoDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pedido_cliente_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  descripcion_tizado?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '3' })
  @Type(() => Number)
  ancho_tela?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '3' })
  @Type(() => Number)
  largo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ref_imagen?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_creacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_modificacion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTizadoTallaDto)
  tallas: CreateTizadoTallaDto[];
}
