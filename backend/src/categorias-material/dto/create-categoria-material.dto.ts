import { IsString, IsBoolean, IsOptional, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreateCategoriaMaterialDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre_categoria?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  tiene_color?: boolean;

  @IsBoolean()
  @IsOptional()
  tiene_talla?: boolean;

  @IsBoolean()
  @IsOptional()
  varia_cantidad_por_talla?: boolean;

  @IsBoolean()
  @IsOptional()
  varia_insumo_por_color?: boolean;

  @IsBoolean()
  @IsOptional()
  tiene_merma?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  porcentaje_merma?: number;
  
  @IsString()
  @IsOptional()
  @MaxLength(50)
  usuario_creacion?: string;
}