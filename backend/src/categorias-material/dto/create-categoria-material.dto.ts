import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @MaxLength(50)
  usuario_creacion?: string;
}